const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { IsApplicationBlocked } = require("./utility/functions");

const app = express()
app.get('/', (req, res) => {
	res.send('Aplicação rodando');
})
app.listen(3059, async () => {
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
		const page = await browser.newPage();
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
			await page.waitForTimeout(2000);
			await page.keyboard.press('Enter');
			await page.waitForTimeout(2000);
			page.setCacheEnabled(false);
			try {
				const name = await page.$eval('[type="submit"]', (input) => {
					return input.getAttribute("value")
				});
				await page.waitForTimeout(2000);
				const bt_sim = await page.$('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button > .ui-button-text');
				if((name == 'Continuar' || bt_sim !== null) ){
					if(bt_sim !== null){
						page.click('.ui-dialog > .ui-dialog-buttonpane > .ui-dialog-buttonset > .ui-button > .ui-button-text');
						await page.waitForTimeout(2000);
					}
					if(name == 'Continuar'){
						
                        await page.click('tbody > tr > td > p > select');
						await page.waitForTimeout(2000);
						await page.keyboard.press('ArrowDown');
						// const extractedText = await page.$eval('tbody > tr > td > p > select > .botao:nth-child(0)', (el) => el.innerText);
						// const extractedText1 = await page.$eval('tbody > tr > td > p > select > .botao:nth-child(1)', (el) => el.innerText);
						// // await page.click('tbody > tr > td > p > .botao:nth-child(1)')
						// console.log(await page.select('tbody > tr > td > p > select > option:nth-child(0)', 'Coconuts') );
                        // if(extractedText == extractedText1){
						
							await page.waitForTimeout(2000);
							await page.keyboard.press('Enter');
							await page.waitForTimeout(2000);
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
										await pageTarget.waitForTimeout(2000);
										pageTarget.close();
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
								const print = await pageTarget1.$('.print > .botao');
								if (print !== null) {
									await pageTarget1.$eval('.print > .botao', e => e.setAttribute("type", "hidden"));
									await pageTarget1.emulateMediaType('screen');
									var dateNow = new Date();
									const pdf = await pageTarget1.pdf({
										margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
										printBackground: true,
										format: 'A4',
									});
									const url1 = pageTarget1.url();
									const raspar = new Crawler({
										callback: function (error, res, done) {
											if (error) {
												console.log(error.message);
												pageTarget1.close();
											} else {
												var groupName = 'C:\\Faturas-automatizado\\' + typing + '\\'+ user[6];
												var enterpriseName = 'C:\\Faturas-automatizado\\' + typing + '\\'+ user[6] + '\\' + user[7];
												var sendDate = user[9];
												if (fs.existsSync(groupName)) {
													if(fs.existsSync(enterpriseName)){
														if(sendDate == '20' || sendDate == '25' || sendDate == '1' ){
															fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - BOLETO ' + user[0] + '.pdf', res.body, function (err) {
																if (err) console.log(err.message);
															});
														}else{
															fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - BOLETO ' + user[0] + '.pdf', res.body, function (err) {
																if (err) console.log(err.message);
															});
														}
													}
												}else if (!fs.existsSync(groupName)){
													fs.mkdirSync(groupName);
													if(!fs.existsSync(enterpriseName)){
														fs.mkdirSync(enterpriseName);
														if(sendDate == '20' || sendDate == '25' || sendDate == '1'){
															fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - BOLETO ' + user[0] + '.pdf', res.body, function (err) {
																if (err) console.log(err.message);
															});
														}else{
															fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - BOLETO ' + user[0] + '.pdf', res.body, function (err) {
																if (err) console.log(err.message);
															});
														}
													}
												}			
												pageTarget1.close();									
											}
											done();
											pageTarget1.close();
										}
									});
									raspar.queue(url1);
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
			}
			catch (err1) {
				if (err1)
					console.log(err1.message);
			}
		}
		catch
		{
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-boleto-saude-csv.txt', user[0] + " - " + user[7] + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally {
		}
	}
}