const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { IsApplicationBlocked } = require("./utility/functions");
const app = express()


app.get('/', (req, res) => {
	res.send('Aplicação rodando');
})
app.listen(3055, async () => {
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
		var page = await browser.newPage();
		var typing = 'Boleto Saúde PDF';
		if (!fs.existsSync('C:\\Faturas-automatizado\\' + typing)) {
			fs.mkdirSync('C:\\Faturas-automatizado\\' + typing);
		}
	
		try {
			await page.goto('https://webhap.hapvida.com.br/pls/webhap/webNewBoletoEmpresa.login');
			await page.waitForTimeout(2000);
			await page.click('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button');
			await page.waitForTimeout('input[name="pCodigo"]');
			await page.type('input[name="pCodigo"]', user[0], { delay: 100 });
			await page.type('input[name="pSenha"]', user[3], { delay: 100 });
			await page.waitForTimeout(4000);
			try {
				await page.keyboard.press('Enter');
				await page.waitForTimeout(4000);
				const extractedText3 = await page.$('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button > .ui-button-text');
				await page.waitForTimeout(4000);
				console.log(extractedText3);
				if(extractedText3 !== null){				
					await page.click('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button > .ui-button-text');
					await page.waitForTimeout(4000);
				}
				await page.waitForTimeout(4000);
				const name = await page.$eval('[type="submit"]', (input) => {
					return input.getAttribute("value")
				});
				await page.waitForTimeout(2000);
				const bt_sim = await page.$('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button > .ui-button-text');
				if((name == 'Continuar' || bt_sim == true) ){
					if(bt_sim == true){
						page.click('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button > .ui-button-text');
						await page.waitForTimeout(2000);
					}
					try{
						if(name == 'Continuar'){
							const popup = await Promise.all([
								new Promise(resolve => page.once('popup', resolve)),
									page.click('[type="submit"]') 
								]);
							popup;
							await page.waitForTimeout(2000);
							const pages = await browser.pages();
							for (const pageTarget of pages) {
								try {
									await pageTarget.waitForTimeout(2000);
									const bt_continuar = await pageTarget.$('#bt_continuar');
									if (bt_continuar !== null) {
										pageTarget.click('#bt_continuar');
										await pageTarget.waitForTimeout(3000);
										pageTarget.close();
										break;
									}
									else{
										pageTarget.close();
									}
								}
								catch (error) {
									if (error) {
										console.log(error.message);								
									}
								}
							}
							const pages1 = await browser.pages();
							for (const pageTarget1 of pages1) {
								try {
									console.log(pageTarget1.url());
								// try {
									const print = await pageTarget1.$('.print > .botao');									
								// 	console.log(print);
								// } catch(err){
								// 	console.log(err)
								// }
									
									if (print !== null) {
										console.log("SIM");
										await pageTarget1.waitForTimeout(4000);
										await pageTarget1.$eval('body > p > input', e => e.setAttribute("type", "hidden"));
										await pageTarget1.waitForTimeout(2000);
										await pageTarget1.emulateMediaType('screen');
										await pageTarget1.waitForTimeout(2000);
										var dateNow = new Date();
										var day = dateNow.getDay();
										const pdf = await pageTarget1.pdf({
											margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
											printBackground: true,
											format: 'A4',
										});
										const url1 = pageTarget1.url();
										await pageTarget1.waitForTimeout(2000);
										const raspar = new Crawler({
											callback: function (error, res, done) {
												if (error) {
													console.log(error.message);
													// pageTarget1.close();
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
													if(sendDate == '20' || sendDate == '25' || sendDate == '1' || sendDate == '5' && day>12){
														fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
															if (err) console.log(err.message);
														});
														fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
															if (err)
																console.log(err.message);
														});	
													}else{
														fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
															if (err) console.log(err.message);
														});
														fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
															if (err)
																console.log(err.message);
														});	
													}	
													pageTarget1.close();								
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
										if (error1)
											console.log(error1.message);
								}
							}
						}
					}
					catch (err5) {
						fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err5) {
							if (err5)
								console.log(err5.message);
						});
						page.close();
					}
				}
				else{
					fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err1) {
					if (err1)
						console.log(err1.message);
					});
				}
			}
			catch (err2) {
				console.log(err2.message);
				fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err2) {
					if (err2)
						console.log(err2.message);
				});
				page.close();
			}
		}
		catch
		{
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err4) {
				if (err4)
					console.log(err4.message);
			});
			page.close();
		}
		finally {
			
		}
	}
}

