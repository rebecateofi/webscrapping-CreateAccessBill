const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { PASTA_GERAR_FATURA_AUTOMATIZADA, ARQUIVO_ACESSOS } = require("./utility/constants");
const { IsApplicationBlocked, CreateFolderIfItDoesNotExists } = require("./utility/functions");

const app = express()

app.get('/', (req, res) => {
	res.send('Aplicação rodando');
})

app.listen(3040, async () => {
	try {
		var data = fs.readFileSync(PASTA_GERAR_FATURA_AUTOMATIZADA + ARQUIVO_ACESSOS)
			.toString() // convert Buffer to string
			.split('\n') // split string to lines
			.map(e => e.trim()) // remove white spaces for each line
			.map(e => e.split(';').map(e => e.trim())); // split each line to array
	}
	catch (err) {
		if (err)
			console.log(err.message);
	}
	if (!await IsApplicationBlocked())
		ExecuteWebScraping(data);
})


async function ExecuteWebScraping(users) 
{
	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
		headless: false,
		executablePath:
			'C:/Arquivos de Programas/Google/Chrome/Application/chrome.exe'
	});
	for (const user of users) {
		var typing = 'Boleto Dental PDF';

		CreateFolderIfItDoesNotExists(PASTA_GERAR_FATURA_AUTOMATIZADA + typing);

		const page = await browser.newPage();
		try {
			await page.goto('https://www.hapvida.com.br/pls/podontow/webNewDentalEmpresarial.pr_login_empresa_opmenu?pOpMenu=3');
			await page.waitForTimeout(2000);
			await page.waitForTimeout('input[name="pCodigoEmpresa"]');
			await page.type('input[name="pCodigoEmpresa"]', user[0], { delay: 0 });
			await page.type('input[name="pSenha"]', user[3], { delay: 0 });
			//user[2], 96301 475271
			await page.keyboard.press('Enter');
			await page.waitForTimeout(2000);
			page.setCacheEnabled(false)
			try {
				const name = await page.$eval('[type="submit"]', (input) => {
					return input.getAttribute("value")
					});
				if((name == 'Gerar') ){
					const popup = await Promise.all([
						new Promise(resolve => page.once('popup', resolve)),
							page.click('[type="submit"]') 
						]);
					popup;
					await page.waitForTimeout(2000);
					const pages = await browser.pages();
					for (const pageTarget of pages) {
						try {
							console.log(pageTarget.url());
							const print = await pageTarget.$('.print > .botao');
							var dateNow = new Date();
							var day = dateNow.getDay();
							if (print !== null) {
								await pageTarget.$eval('.print > .botao', e => e.setAttribute("type", "hidden"));
								await pageTarget.emulateMediaType('screen');
								const pdf = await pageTarget.pdf({
									margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
									printBackground: true,
									format: 'A4',
								});
								const url1 = pageTarget.url();
								const raspar = new Crawler({
									callback: function (error, res, done) {
										if (error) {
											console.log(error.message);
											pageTarget.close();
										} else {
											var groupName = PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\'+ user[6];
											var enterpriseName = PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\'+ user[6] + '\\' + user[7];
											var sendDate = user[9];
											CreateFolderIfItDoesNotExists(groupName);
											
											CreateFolderIfItDoesNotExists(enterpriseName);
											
											if(sendDate == '20' || sendDate == '25' ||  sendDate == '5'){
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
													if (err) console.log(err.message);
												});
												fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
													if (err)
														console.log(err.message);
												});	
											}else{
												fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
													if (err) console.log(err.message);
												});
												fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
													if (err)
														console.log(err.message);
												});	
											}					
										}
										done();
									}
								});
								raspar.queue(url1);
								break;
							}
							else{
								continue;
							}
						}
						catch (error1) {
							if (error1) {
								console.log(error1.message);
							}
						}
					}
				}
			}
			catch (err1) {
				fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err1) {
					if (err1)
						console.log(err1.message);
				});
			}
		}
		catch
		{
			fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally {
			page.close() 
			}
		}
}


