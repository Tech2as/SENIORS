require('dotenv').config();  // Certifique-se de que está logo no início

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// Carregar variáveis de ambiente
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    console.error("Erro: SECRET_KEY não está definida!");
    process.exit(1);
}


// Configuração do banco de dados usando variáveis do .env
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    }
    console.log("Conexão bem-sucedida ao MySQL!");
    connection.release();
});

app.use(express.json());
app.use(cors());

// Rota de registro
app.post('/registro', (req, res) => {
    const { nome, funcao, email, senha } = req.body;

    // Verifica se todos os campos estão presentes
    if (!nome || !funcao || !email || !senha) {
        return res.status(400).send({
            success: false,
            message: 'Todos os campos (nome, função, email, senha) são obrigatórios.'
        });
    }

    // Criptografa a senha
    const hashedPassword = bcrypt.hashSync(senha, 8);

    // Insere os dados no banco
    db.query(
        'INSERT INTO usuarios (nome, funcao, email, senha) VALUES (?, ?, ?, ?)',
        [nome, funcao, email, hashedPassword],
        (err, results) => {
            if (err) {
                console.error("Erro no servidor durante o registro:", err);

                // Verifica erros específicos, como email duplicado
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({
                        success: false,
                        message: 'O email já está em uso.'
                    });
                }

                return res.status(500).send({
                    success: false,
                    message: 'Erro no servidor.'
                });
            }

            res.status(201).send({
                success: true,
                message: 'Usuário registrado com sucesso!'
            });
        }
    );
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error("Erro no servidor:", err);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const user = results[0];

        // Validação de senha
        const passwordIsValid = bcrypt.compareSync(senha, user.senha);
        if (!passwordIsValid) {
            return res.status(401).json({ auth: false, message: 'Senha inválida.' });
        }

        // Gera o token JWT, incluindo ID e função do usuário
        const token = jwt.sign(
            { id: user.id, nome: user.nome, funcao: user.funcao },
            SECRET_KEY,
            { expiresIn: "1h" } // Expiração de 24 horas
        );

        res.status(200).json({
            auth: true,
            token: token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                funcao: user.funcao
            },
            message: 'Login realizado com sucesso!'
        });
    });
});

// Salvar sinistro no BD
app.post('/save-sinistro', (req, res) => {
    const { userid, username, profissional, data, horario } = req.body;
    // Verificar se todos os dados obrigatórios foram enviados
    if (!userid || !username || !profissional || !data || !horario) {
        return res.status(400).send({
            success: false,
            message: 'Todos os campos são obrigatórios.'
        });
    }

    // Inserção da consulta no banco de dados
    db.query(
        'INSERT INTO consultas (id_paciente, nome_paciente, id_psicologo, data, hora, estado) VALUES (?, ?, ?, ?, ?, ?)',
        [userid, username, profissional, data, horario, 'andamento'],
        (err, results) => {
            if (err) {
                console.error("Erro no servidor durante o registro:", err);
                return res.status(500).send({
                    success: false,
                    message: 'Erro no servidor ao registrar a consulta.'
                });
            }
            // Se a inserção for bem-sucedida
            res.status(201).send({
                success: true,
                message: 'Consulta registrada com sucesso!'
            });
        }
    );
});
// search conta
app.get('/search-conta', (req, res) => {
    const { userId } = req.query;

    // Verifica se o userId foi passado
    if (!userId) {
        return res.status(400).send({ message: "userId é obrigatório" });
    }

    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            return res.status(500).send({ message: 'Erro ao buscar usuário', error: err });
        }

        // Verifica se encontrou algum resultado
        if (results.length === 0) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        // Retorna o primeiro resultado, assumindo que há um único usuário para o userId
        res.json({
            data: results[0], // Envia o primeiro usuário encontrado
        });
    });
});

app.post('/save-conta', (req, res) => {
    try {
        const { id, nome, email, senha } = req.body;

        if (!id || !nome || !email) {
            return res.status(400).send({
                success: false,
                message: 'Todos os campos obrigatórios, exceto senha, devem ser preenchidos.',
            });
        }

        // Recupera a senha atual do banco de dados
        db.query('SELECT senha FROM usuarios WHERE id = ?', [id], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar a senha:", err);
                return res.status(500).send({
                    success: false,
                    message: 'Erro no servidor ao buscar a senha atual.',
                });
            }

            if (rows.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: 'Usuário não encontrado.',
                });
            }

            const senhaAtual = rows[0].senha;

            // Determina se a senha deve ser atualizada
            let novaSenha = senhaAtual;
            if (senha && senha !== senhaAtual) {
                novaSenha = bcrypt.hashSync(senha, 8);
            }

            // Atualiza os dados do usuário
            db.query(
                'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?',
                [nome, email, novaSenha, id],
                (err, results) => {
                    if (err) {
                        console.error("Erro ao atualizar os dados:", err);
                        return res.status(500).send({
                            success: false,
                            message: 'Erro no servidor ao atualizar os dados.',
                        });
                    }

                    if (results.affectedRows === 0) {
                        return res.status(404).send({
                            success: false,
                            message: 'Usuário não encontrado.',
                        });
                    }

                    res.status(200).send({
                        success: true,
                        message: 'Dados atualizados com sucesso!',
                    });
                }
            );
        });
    } catch (err) {
        console.error("Erro inesperado:", err);
        res.status(500).send({
            success: false,
            message: 'Erro inesperado no servidor.',
        });
    }
});

// cancelar consulta
app.get("/get-delete", (req, res) => {
    const id = req.query.id;
    const sql = 'SELECT id FROM consultas WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});


// Search para psicologos
app.get('/search-atendimento', (req, res) => {
    const { userId, page = 1, limit = 5 } = req.query;
    console.log('userId:', userId, 'page:', page, 'limit:', limit); // Verifique os parâmetros
    if (!userId) {
        return res.status(400).send({ message: "userId é obrigatório" });
    }

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);

    const offset = (pageNumber - 1) * pageLimit;

    const sql = 'SELECT * FROM consultas WHERE id_psicologo = ? LIMIT ? OFFSET ?';
    db.query(sql, [userId, pageLimit, offset], (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            return res.status(500).send({ message: 'Erro ao buscar consultas', error: err });
        }

        const countSql = 'SELECT COUNT(*) AS count FROM consultas WHERE id_paciente = ?';
        db.query(countSql, [userId], (countErr, countResults) => {
            if (countErr) {
                console.error('Erro ao contar consultas:', countErr);
                return res.status(500).send({ message: 'Erro ao contar consultas', error: countErr });
            }

            res.json({
                data: results,
                total: countResults[0].count,
                page: pageNumber,
                limit: pageLimit
            });
        });
    });
});

// Search para pacientes
app.get('/search-consultas', (req, res) => {
    const { userId, page = 1, limit = 5 } = req.query;
    console.log('userId:', userId, 'page:', page, 'limit:', limit); // Verifique os parâmetros
    if (!userId) {
        return res.status(400).send({ message: "userId é obrigatório" });
    }

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);

    const offset = (pageNumber - 1) * pageLimit;

    const sql = 'SELECT consultas.*, usuarios.nome AS nome FROM consultas INNER JOIN usuarios ON consultas.id_psicologo = usuarios.id WHERE consultas.id_paciente = ? LIMIT ? OFFSET ?';
    db.query(sql, [userId, pageLimit, offset], (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            return res.status(500).send({ message: 'Erro ao buscar consultas', error: err });
        }

        const countSql = 'SELECT COUNT(*) AS count FROM consultas WHERE id_paciente = ?';
        db.query(countSql, [userId], (countErr, countResults) => {
            if (countErr) {
                console.error('Erro ao contar consultas:', countErr);
                return res.status(500).send({ message: 'Erro ao contar consultas', error: countErr });
            }

            res.json({
                data: results,
                total: countResults[0].count,
                page: pageNumber,
                limit: pageLimit
            });
        });
    });
});

app.get('/search-name-user', (req, res) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        console.log('Nenhum token fornecido');
        return res.status(401).send({ auth: false, message: 'Token não fornecido.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Erro na verificação do token:', err); // Verifique o erro de verificação do JWT
            return res.status(500).send({ auth: false, message: 'Falha na autenticação do token.' });
        }

        db.query('SELECT * FROM usuarios WHERE id = ?', [decoded.id], (err, results) => {
            if (err) {
                console.error('Erro ao executar a consulta no banco de dados:', err); // Verifique erros na consulta SQL
                return res.status(500).send('Erro no servidor.');
            }
            if (results.length === 0) {
                console.log('Usuário não encontrado com o ID:', decoded.id);
                return res.status(404).send('Usuário não encontrado.');
            }

            res.status(200).send(results[0]); // Envie os resultados corretamente
        });
    });
});

app.get('/search-function-user', (req, res) => {
    const id = req.query.id;
    const sql = 'SELECT * FROM usuarios WHERE funcao = "psicologo "';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err); // Log para erro na consulta
            return res.status(500).send(err);
        }

        res.json(results);
    });
});

// Rota protegida de exemplo
app.get('/me', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'Token não fornecido.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Falha na autenticação do token.' });
        }

        db.query('SELECT * FROM usuario WHERE id = ?', [decoded.id], (err, results) => {
            if (err) {
                return res.status(500).send('Erro no servidor.');
            }
            if (results.length === 0) {
                return res.status(404).send('Usuário não encontrado.');
            }

            res.status(200).send(results[0]);
        });
    });
});

app.listen(3002, () =>{
    console.log("3002")
}) 
