const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { IsApplicationBlocked, CreateFolderIfItDoesNotExists } = require("./utility/functions");

{
	const app = express()
	app.get('/', (req, res) => {
		res.send('Aplicação rodando');
	})
	app.listen(3054, async () => {
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
}
async function ExecuteWebScraping(users) {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath:
			'C:/Arquivos de Programas/Google/Chrome/Application/chrome.exe'
	});
	for (const user of users) {
		const page = await browser.newPage();
		var typing = 'Fatura Dental csv';

		CreateFolderIfItDoesNotExists('C:\\Faturas-automatizado\\' + typing);

		try {
			await page.waitForTimeout(2000);
			await page.goto('https://www.hapvida.com.br/pls/podontow/webNewDentalEmpresarial.pr_login_empresa_opmenu?pOpMenu=8');
			await page.waitForTimeout('input[name="pCodigoEmpresa"]');
			await page.type('input[name="pCodigoEmpresa"]', user[0], { delay: 100 });
			await page.type('input[name="pSenha"]', user[2], { delay: 100 });
			await page.waitForTimeout(3000);
			await page.keyboard.press('Enter');
			await page.waitForTimeout(3000);
			//user[2], 96301 475271
			await page.waitForTimeout(3000);
			await page.click('tr:nth-child(1) > td > strong > small > a');
			for(var i=1; i<=9; i++){
				var extractedText1 = await page.$eval('tbody > tr:nth-child('+5*(i)+') > td:nth-child(1) > small > a', (el) => el.innerText);
				const substring = user[1];
				const extension2 = "CSV";
				const constCode = extractedText1.includes(substring);
				const constExtension = extractedText1.includes(extension2);
				var dateNow = new Date();
				var sendDate = user[9];
				var months = 0;
				var day = dateNow.getDay();
				var extractedText2 = await page.$eval('tbody > tr:nth-child('+5*(i)+') > td:nth-child(2) > small', (el) => el.innerText);
				if(sendDate == '20' || sendDate == '25'){
					months = dateNow.getMonth()+2;
					if(months == 13){
						months = 01;
					}
				}else{
					months = dateNow.getMonth()+1;
				}	
				await page.waitForTimeout(3000);
				function splitStr(str) {
					console.log(str);
					const monthDate = str.split(" ")[2];
					global.monthDate1 = monthDate.split("/")[1];
				}
				splitStr(extractedText2); 
				console.log(monthDate1);

			 
				await page.waitForTimeout(3000);	
				console.log(substring);
				console.log(extractedText1);
				if((constCode == true && monthDate1 == months) && constExtension == true){
						
					
					await page.click('tbody > tr:nth-child('+5*(i)+') > td:nth-child(1) > small > a');					
					await page.waitForTimeout(1000);			
					await page.click('tr > td > p > a');
					await page.waitForTimeout(1000);
					const pages = await browser.pages();

					for (const pageTarget of pages) {
						try {
							await pageTarget.waitForTimeout(2000);
							const bt_continuar = await pageTarget.$('embed');
							if (bt_continuar !== null) {
								await pageTarget.waitForTimeout(2000);
								const url1 = pageTarget.url();
								const raspar = new Crawler({
									callback: function (error, res, done) {
										if (error) {
											console.log(error.message);
											pageTarget.close();
										} else {
											var groupName = 'C:\\Faturas-automatizado\\' + typing + '\\'+ user[6];
											var enterpriseName = 'C:\\Faturas-automatizado\\' + typing + '\\'+ user[6] + '\\' + user[7];
											
											CreateFolderIfItDoesNotExists(groupName);

											CreateFolderIfItDoesNotExists(enterpriseName);

											if(sendDate == '20' || sendDate == '25'){
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - FATURA ' + user[1] + '.csv', res.body, function (err) {
													if (err) console.log(err.message);
												});
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-fatura-dental-csv.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
													if (err)
														console.log(err.message);
												});	
											}else{
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - FATURA ' + user[1] + '.csv', res.body, function (err) {
													if (err) console.log(err.message);
												});
												fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-fatura-dental-csv.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
													if (err)
														console.log(err.message);
												});
											}	
										}
										done();
									}
								});
								raspar.queue(url1);
								pageTarget.close();
								break;
							}
							else{
								continue;				
							}
						}
						catch (error) {
							if (error) {
								console.log(error.message);
							}
						}
					}
				}else if(constCode !== true || monthDate1 !== months){
					continue;
				}
					break;
				
			}
		}
		catch(error7)
		{
			if (error7) {
				console.log(error7.message);
			}
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-fatura-dental-csv.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally { page.close() }
	}
}