const PASTA_GERAR_FATURA_AUTOMATIZADA = 'C:\\Faturas-automatizado\\';
const ARQUIVO_ACESSOS = 'acesso.csv';
const path = require('path');
const os = require('os');
const userHomeDir = os.homedir();
const userDir = path.join(userHomeDir, 'Downloads'); 

module.exports = {
    PASTA_GERAR_FATURA_AUTOMATIZADA,
    ARQUIVO_ACESSOS,
    userDir,
};