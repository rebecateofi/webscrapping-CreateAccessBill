const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { PASTA_GERAR_FATURA_AUTOMATIZADA, ARQUIVO_ACESSOS, typingBillHealthPDF, dateNow, day} = require("./utility/constants");
const { IsApplicationBlocked, CreateFolderIfItDoesNotExists } = require("./utility/functions");
const app = express()


app.get('/', (req, res) => {
	res.send('Aplicação rodando');
})
app.listen(3055, async () => {
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
async function ExecuteWebScraping(users) {
	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
		headless: false,
		executablePath:
			'C:/Arquivos de Programas/Google/Chrome/Application/chrome.exe'
	});
	for (const user of users) {
		var page = await browser.newPage();
		CreateFolderIfItDoesNotExists(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF);
	
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

				const selectHandle = await page.$('body > div.main.corpo > div > div > small > form > table > tbody > tr:nth-child(3) > td:nth-child(3) > p > select');
  
				const options = await selectHandle.$$('body > div.main.corpo > div > div > small > form > table > tbody > tr:nth-child(3) > td:nth-child(3) > p > select > option');
				function splitStr(str) {
					const monthDate = str.split(" ")[2];
					global.monthDate1 = monthDate.split("/")[1];
				}
				splitStr(extractedText2); 
				// for (let option of options) {
				//   const optionText = await option.getProperty('textContent');
				//   console.log(`Text: ${await optionText.jsonValue()}`);
				// }
				// await page.click('body > div.main.corpo > div > div > small > form > table > tbody > tr:nth-child(3) > td:nth-child(3) > p > select > option');
				await page.waitForTimeout(4000);

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
									const print = await pageTarget1.$('.print > .botao');									
	
									if (print !== null) {
										await pageTarget1.waitForTimeout(4000);
										await pageTarget1.$eval('body > p > input', e => e.setAttribute("type", "hidden"));
										await pageTarget1.waitForTimeout(2000);
										await pageTarget1.emulateMediaType('screen');
										await pageTarget1.waitForTimeout(2000);
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
												} else {
													var groupName = PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\'+ user[6];
													var enterpriseName = PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\'+ user[6] + '\\' + user[7];
													var sendDate = user[9];
													const isDateValid = (sendDate == '20' || sendDate == '25') && day >= 16;
													const isOtherDateValid = (sendDate == '1' || sendDate == '5') && day > 25;
									
													CreateFolderIfItDoesNotExists(groupName);
													CreateFolderIfItDoesNotExists(enterpriseName);
													if(isDateValid || isOtherDateValid){
														fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
															if (err) console.log(err.message);
														});
														fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
															if (err)
																console.log(err.message);
														});	
													}else{
														fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - BOLETO ' + user[1] + '.pdf', pdf, function (err) {
															if (err) console.log(err.message);
														});
														fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
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
						fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err5) {
							if (err5)
								console.log(err5.message);
						});
						page.close();
					}
				}
				else{
					fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err1) {
					if (err1)
						console.log(err1.message);
					});
				}
			}
			catch (err2) {
				console.log(err2.message);
				fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err2) {
					if (err2)
						console.log(err2.message);
				});
				page.close();
			}
		}
		catch
		{
			fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingBillHealthPDF + '\\problem-boleto-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err4) {
				if (err4)
					console.log(err4.message);
			});
			page.close();
		}
		finally {
			
		}
	}
}

