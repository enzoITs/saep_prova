DROP SCHEMA IF EXISTS saep_banco;
CREATE SCHEMA IF NOT EXISTS saep_banco;
DROP DATABASE IF EXISTS saep_banco;
CREATE DATABASE saep_banco;
USE saep_banco;

CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(250) NOT NULL,
    quantidade INT NOT NULL,
    valor_unidade DECIMAL NOT NULL,
    categoria VARCHAR (250) NOT NULL
);

CREATE TABLE movimentacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dt DATETIME NOT NULL,
    tipo ENUM('Entrada', 'Saída') NOT NULL,
    quantidade INT NOT NULL,
    id_produtos INT NOT NULL,
    FOREIGN KEY (id_produtos) REFERENCES produtos(id)
);
