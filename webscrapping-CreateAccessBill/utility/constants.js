const PASTA_GERAR_FATURA_AUTOMATIZADA = 'C:\\Faturas-automatizado\\';
const ARQUIVO_ACESSOS = 'acesso.csv';
const path = require('path');
const os = require('os');
const userHomeDir = os.homedir();
const userDir = path.join(userHomeDir, 'Downloads'); 
var typingHealthCSV = 'Fatura Saúde CSV';
var typingHealthPDF = 'Fatura Saúde PDF';
var typingDentalCSV = 'Fatura Dental CSV';
var typingDentalPDF = 'Fatura Dental PDF';
var typingBillHealthPDF = 'Boleto Saúde PDF';
var typingBillDentalPDF = 'Boleto Dental PDF';
var typingNFHealthPDF = 'Nota Fiscal Saúde PDF';
var typingNFDentalPDF = 'Nota Fiscal Dental PDF';
var dateNow = new Date();
const extensionCSV = "CSV";
const extensionPDF = "PDF";
var months = 0;
var day = dateNow.getDate();

module.exports = {
    PASTA_GERAR_FATURA_AUTOMATIZADA,
    ARQUIVO_ACESSOS,
    userDir,
    typing,
    dateNow,
    extensionCSV,
    extensionPDF,
    typingHealthCSV,
    typingHealthPDF,
    typingDentalCSV,
    typingDentalPDF,
    typingBillHealthPDF,
    typingBillDentalPDF,
    typingNFHealthPDF,
    typingNFDentalPDF,
    months,
    day
};

typing, dateNow, extension, months, day