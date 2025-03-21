import * as dotenv from "dotenv";
import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Carregar variáveis de ambiente
const SECRET_KEY = process.env.SECRET_KEY as string;

if (!SECRET_KEY) {
    console.error("Erro: SECRET_KEY não está definida!");
    process.exit(1);
}


// Configuração do banco de dados usando variáveis do .env
declare namespace NodeJS {
    export interface ProcessEnv {
      SECRET_KEY: string;
      DB_HOST: string;
      DB_USER: string;
      DB_PASS: string;
      DB_NAME: string;
      PORT: string;
    }
  }

  const db: mysql.Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
app.use(express.json());
app.use(cors());

// Rota de registro
app.post('/registro', (req: express.Request, res: express.Response) => {
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
        (err: any, results: any) => {
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

app.post('/login', (req: any, res: any) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err: any, results: any) => {
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
            { expiresIn: "1h" } // Expiração de 1 hora
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
app.post('/save-sinistro', (req: any, res: any) => {
    const { apolice, aviso, chassi, aon, regulador, data, observacoes, status } = req.body;

    if (!apolice || !aviso || !chassi || !data) {
        return res.status(400).send({
            success: false,
            message: 'Todos os campos obrigatórios devem ser preenchidos.'
        });
    }

    // Verifica se já existe um sinistro com o mesmo aviso OU chassi
    db.query(
        'SELECT * FROM sinistros WHERE aviso = ? OR chassi = ?',
        [aviso, chassi],
        (err: any, results: any) => {
            if (err) {
                console.error("Erro no servidor:", err);
                return res.status(500).send({
                    success: false,
                    message: 'Erro no servidor ao verificar o sinistro.'
                });
            }

            if (results.length > 0) {
                return res.status(409).send({
                    success: false,
                    message: 'Já existe um sinistro cadastrado com este número de aviso ou chassi.'
                });
            }

            // Se não existir, insere o novo sinistro
            db.query(
                'INSERT INTO sinistros (apolice, aviso, chassi, aon, regulador, data, observacoes, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [apolice, aviso, chassi, aon, regulador, data, observacoes, status],
                (err: any, results: any) => {
                    if (err) {
                        console.error("Erro ao registrar sinistro:", err);
                        return res.status(500).send({
                            success: false,
                            message: 'Erro ao registrar o sinistro.'
                        });
                    }
                    res.status(201).send({
                        success: true,
                        message: 'Sinistro registrado com sucesso!'
                    });
                }
            );
        }
    );
});


//edit sinistro
app.post('/edit-sinistro', (req: any, res: any) => {
    const { id, apolice, aviso, chassi, aon, data, observacoes, status } = req.body;

    // Verificar se todos os dados obrigatórios foram enviados
    if (!id || !apolice || !aviso || !chassi || !data) {
        return res.status(400).send({
            success: false,
            message: 'Todos os campos obrigatórios devem ser preenchidos.'
        });
    }

    // Atualizar os dados no banco de dados
    db.query(
        'UPDATE sinistros SET apolice=?, aviso=?, chassi=?, aon=?, data=?, observacoes=?, estado=? WHERE id=?',
        [apolice, aviso, chassi, aon, data, observacoes, status, id],
        (err: any, results: any) => {
            if (err) {
                console.error("Erro no servidor durante a atualização:", err);
                return res.status(500).send({
                    success: false,
                    message: 'Erro no servidor ao atualizar o sinistro.'
                });
            }

            // Verificar se alguma linha foi afetada
            if (results.affectedRows === 0) {
                return res.status(404).send({
                    success: false,
                    message: 'Sinistro não encontrado.'
                });
            }

            res.status(200).send({
                success: true,
                message: 'Sinistro atualizado com sucesso!'
            });
        }
    );
});
  
// search conta
app.get('/search-conta', (req: any, res: any) => {
    const { userId } = req.query;

    // Verifica se o userId foi passado
    if (!userId) {
        return res.status(400).send({ message: "userId é obrigatório" });
    }

    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    db.query(sql, [userId], (err: any, results: any) => {
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

//sinistro
app.get('/filter-sinistro', (req: any, res: any) => {
    const { tipo, status, page = 1, limit = 5 } = req.query;
    
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const offset = (pageNumber - 1) * pageLimit;

    let sql = '';
    let countSql = '';
    const queryParams: any[] = [];
    const countParams: any[] = [];

    if (status === 'Todos' || status === '') {
        sql = 'SELECT * FROM sinistros ORDER BY id DESC LIMIT ? OFFSET ?';
        countSql = 'SELECT COUNT(*) AS total FROM sinistros';
        queryParams.push(pageLimit, offset);

    } else if (tipo === 'apolice') {
        sql = 'SELECT * FROM sinistros ' +
              'WHERE apolice = ? OR estado = ? ' + 
              'ORDER BY id DESC LIMIT ? OFFSET ?';
        countSql = 'SELECT COUNT(*) AS total FROM sinistros WHERE apolice = ? OR estado = ?';
        queryParams.push(status, status, pageLimit, offset);
        countParams.push(status, status);

    } else if (tipo === 'estado') {
        sql = 'SELECT * FROM sinistros ' + 
              'WHERE estado = ? ' + 
              'ORDER BY id DESC LIMIT ? OFFSET ?';
        countSql = 'SELECT COUNT(*) AS total FROM sinistros WHERE estado = ?';
        queryParams.push(status, pageLimit, offset);
        countParams.push(status);

    } else if (tipo === 'texto') {
        sql = "SELECT * FROM sinistros WHERE aviso LIKE ? OR chassi LIKE ? OR AON LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?";
        countSql = "SELECT COUNT(*) AS total FROM sinistros WHERE aviso LIKE ? OR chassi LIKE ? OR AON LIKE ?";
        queryParams.push(`%${status}%`, `%${status}%`, `%${status}%`, pageLimit, offset);
        countParams.push(`%${status}%`, `%${status}%`, `%${status}%`);
    }

    db.query(countSql, countParams, (err: any, countResults: any) => {
        if (err) {
            console.error('Erro ao contar registros:', err);
            return res.status(500).send({ message: 'Erro ao contar sinistros', error: err });
        }

        const totalRegistros = countResults[0].total;
        const totalPages = Math.ceil(totalRegistros / pageLimit);

        db.query(sql, queryParams, (err: any, results: any) => {
            if (err) {
                console.error('Erro na consulta SQL:', err);
                return res.status(500).send({ message: 'Erro ao buscar sinistros', error: err });
            }
            
            res.json({
                data: results,
                total: totalRegistros,
                totalPages: totalPages,
                currentPage: pageNumber
            });
        });
    });
});


app.post('/save-conta', (req: any, res: any) => {
    try {
        const { id, nome, email, senha } = req.body;

        if (!id || !nome || !email) {
            return res.status(400).send({
                success: false,
                message: 'Todos os campos obrigatórios, exceto senha, devem ser preenchidos.',
            });
        }

        // Recupera a senha atual do banco de dados
        db.query('SELECT senha FROM usuarios WHERE id = ?', [id], (err: any, rows: any) => {
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
                (err: any, results: any) => {
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


//Ver sinistros pelo id
app.get("/get-sinistro", (req: any, res: any) => {
    const id = req.query.id;
 
    const sql = 'SELECT * FROM sinistros WHERE id = ?';
    db.query(sql, [id], (err: any, results: any) => {
         if (err) {
             console.error('Erro na consulta SQL:', err); // Log para erro na consulta
             return res.status(500).send(err);
         }
         res.json(results);
     });
 });

app.get('/search-name-user', (req: any, res: any) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        console.log('Nenhum token fornecido');
        return res.status(401).send({ auth: false, message: 'Token não fornecido.' });
    }

    jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
        if (err) {
            console.error('Erro na verificação do token:', err); // Verifique o erro de verificação do JWT
            return res.status(500).send({ auth: false, message: 'Falha na autenticação do token.' });
        }

        db.query('SELECT * FROM usuarios WHERE id = ?', [decoded.id], (err: any, results: any) => {
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

app.get('/search-function-user', (req: any, res: any) => {
    const id = req.query.id;
    const sql = 'SELECT * FROM usuarios WHERE funcao = "psicologo "';
    
    db.query(sql, [id], (err: any, results: any) => {
        if (err) {
            console.error('Erro na consulta SQL:', err); // Log para erro na consulta
            return res.status(500).send(err);
        }

        res.json(results);
    });
});

// Rota protegida de exemplo
app.get('/me', (req: any, res: any) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'Token não fornecido.' });
    }

    jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Falha na autenticação do token.' });
        }

        db.query('SELECT * FROM usuario WHERE id = ?', [decoded.id], (err: any, results: any) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});