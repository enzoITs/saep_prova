const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar produtos' });
        } else {
            res.json(results);
        }
    });
}); 

router.get('/categoria', (req, res) => {
    db.query('SELECT categoria, SUM(quantidade * valor_unidade) AS total_categoria FROM produtos GROUP BY categoria', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar categorias' });
        } else {
            res.json(results);
        }
    });
});

router.get('/registros_ordem', (req, res) => {
    db.query('SELECT * FROM movimentacoes ORDER BY dt DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar logs' });
        } else {
            res.json(results);
        }
    });
}); 

router.post('/cadastrar', (req, res) => {
    const { nome, quantidade, valor_unidade, categoria } = req.body;
    db.query('INSERT INTO produtos (nome, quantidade, valor_unidade, categoria) VALUES (?, ?, ?, ?)', [nome, quantidade, valor_unidade, categoria], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao inserir informações', err});
        } else {
            res.json(results);
        }
    });
});

router.post('/registro', (req, res) => {
    const { dt, tipo, quantidade, id_produtos } = req.body;
    db.query('INSERT INTO movimentacoes (dt, tipo, quantidade, id_produtos) VALUES (?, ?, ?, ?)', [dt, tipo, quantidade, id_produtos], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao inserir informações', err});
        } else {
            res.json(results);
        }
    });
});

router.post('/porcentagem', (req, res) => {
    const limiteMaximo = req.body.limite_maximo || 100;
    const limiteMinimo = req.body.limite_minimo ?? 0;

    const sql = `
        SELECT 
            id, 
            nome, 
            quantidade, 
            categoria,
            ROUND((quantidade / ?) * 100, 2) AS percentual_atingido
        FROM produtos
        WHERE quantidade <= ? 
           OR quantidade >= ?
    `;

    db.query(sql, [limiteMaximo, limiteMinimo, limiteMaximo], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar o relatório de estoque' });
        } else {
            res.json({
                filtros_aplicados: {
                    minimo: limiteMinimo,
                    maximo: limiteMaximo
                },
                produtos_no_limite: results
            });
        }
    });
});

router.get('/maiores_saidas', (req, res) => {
    // Recebendo as datas via Query Parameters (?data_inicio=AAAA-MM-DD&data_fim=AAAA-MM-DD)
    const { data_inicio, data_fim } = req.query;

    // Validação básica para garantir que as datas foram enviadas
    if (!data_inicio || !data_fim) {
        return res.status(400).json({ error: 'As datas inicial (data_inicio) e final (data_fim) são obrigatórias.' });
    }

    const sql = `
        SELECT 
            p.nome AS nome_produto,
            SUM(m.quantidade) AS quantidade_total_saida,
            SUM(m.quantidade * p.valor_unidade) AS valor_total_financeiro
        FROM movimentacoes m
        INNER JOIN produtos p ON m.id_produtos = p.id
        WHERE m.tipo = 'saida' 
          AND m.dt BETWEEN ? AND ?
        GROUP BY p.id, p.nome
        ORDER BY quantidade_total_saida DESC;
    `;

    db.query(sql, [data_inicio, data_fim], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao gerar o relatório de saídas.' });
        } else {
            res.json(results);
        }
    });
});

module.exports = router;
