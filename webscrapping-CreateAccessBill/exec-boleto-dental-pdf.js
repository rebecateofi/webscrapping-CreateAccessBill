const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const app = express()
app.get('/', (req, res) => {
	res.send('Aplicação rodando');
})
app.listen(3040, async () => {
	try {
		var data = fs.readFileSync('C:\\Faturas-automatizado\\acesso.csv')
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
async function ExecuteWebScraping(users) {
	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
		headless: false,
		executablePath:
			'C:/Arquivos de Programas/Google/Chrome/Application/chrome.exe'
	});
	for (const user of users) {
		var typing = 'Boleto Dental PDF';
		if (!fs.existsSync('C:\\Faturas-automatizado\\' + typing)) {
			fs.mkdirSync('C:\\Faturas-automatizado\\' + typing);
		}
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
											var groupName = 'C:\\Faturas-automatizado\\' + typing + '\\'+ user[6];
											var enterpriseName = 'C:\\Faturas-automatizado\\' + typing + '\\'+ user[6] + '\\' + user[7];
											var sendDate = user[9];
											if (!fs.existsSync(groupName)){
												fs.mkdirSync(groupName);
											}
											if(!fs.existsSync(enterpriseName)){
												fs.mkdirSync(enterpriseName);
											}
											if(sendDate == '20' || sendDate == '25'){
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
													if (err) console.log(err.message);
												});
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
													if (err)
														console.log(err.message);
												});	
											}else{
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
													if (err) console.log(err.message);
												});
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
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
				fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err1) {
					if (err1)
						console.log(err1.message);
				});
			}
		}
		catch
		{
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-dental-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally {
			page.close() 
			}
		}
	}

async function IsApplicationBlocked(message) {
	var limitDate = new Date("2023-12-10T00:00:00");
	var dateNow = new Date();
	if (limitDate < dateNow) {
		await ShowMessage('A aplicação necessita de atualização!\nDigite enter para fechar.');
		return true;
	}
	else {
		return false;
	}
}
async function ShowMessage(message) {
	const { promisify } = require('util');
	const readline = require('readline');
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	const question = promisify(
		rl.question
	).bind(rl);
	await question(message);
}
