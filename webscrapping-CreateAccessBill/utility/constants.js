const PASTA_GERAR_FATURA_AUTOMATIZADA = 'C:\\Faturas-automatizado\\';
const ARQUIVO_ACESSOS = 'acesso.csv';
const path = require('path');
const os = require('os');
const userHomeDir = os.homedir();
const userDir = path.join(userHomeDir, 'Downloads'); 
const isDateValid = (sendDate == '20' || sendDate == '25') && day > 16;
const isOtherDateValid = (sendDate == '1' || sendDate == '5') && day > 25;

module.exports = {
    PASTA_GERAR_FATURA_AUTOMATIZADA,
    ARQUIVO_ACESSOS,
    userDir,
    isDateValid,
    isOtherDateValid
};