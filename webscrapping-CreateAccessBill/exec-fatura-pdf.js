const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { PASTA_GERAR_FATURA_AUTOMATIZADA, ARQUIVO_ACESSOS, typingHealthPDF, dateNow, extensionPDF, day } = require("./utility/constants");
const { IsApplicationBlocked, CreateFolderIfItDoesNotExists } = require("./utility/functions");

{
	const app = express()
	app.get('/', (req, res) => {
		res.send('Aplicação rodando');
	})
	app.listen(3051, async () => {
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
}
async function ExecuteWebScraping(users) {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath:
			'C:/Arquivos de Programas/Google/Chrome/Application/chrome.exe'
	});
	for (const user of users) {
		const page = await browser.newPage();
		CreateFolderIfItDoesNotExists(PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF);
		try {
			await page.goto('https://webhap.hapvida.com.br/pls/webhap/webNewTrocaArquivo.login');
			await page.waitForTimeout('input[name="pCpf"]');
			await page.type('input[name="pCpf"]', user[8], { delay: 0 });
			await page.type('input[name="pSenha"]', user[2], { delay: 00 });
			await page.keyboard.press('Enter');
			await page.waitForTimeout(1000);
			await page.click('.ultimas_noticias > table > tbody > tr > td > strong > small > a');
			var linksCount = await page.$$eval('#table_id > tbody > tr', links => links.length);
			for(var i=1; i<=9; i++){

				await page.waitForTimeout(1000);
				var extractedText1 = await page.$eval('#table_id > tbody > tr:nth-child('+(i)+') > td.sorting_1 > small > a', (el) => el.innerText);
				const substring = user[1];
				const constCode = extractedText1.includes(substring);
				const constExtension = extractedText1.includes(extensionPDF);
				var sendDate = user[9];
				const isDateValid = (sendDate == '20' || sendDate == '25') && day >= 16;
				const isOtherDateValid = (sendDate == '1' || sendDate == '5') && day > 25;

				var extractedText2 = await page.$eval('#table_id > tbody > tr:nth-child('+(i)+') > td:nth-child(2) > small', (el) => el.innerText);
				if(isDateValid || isOtherDateValid){
					months = dateNow.getMonth()+2;
					if(months == 13){
						months = 01;
					}
				}else{
					months = dateNow.getMonth()+1;
					if(months == 12){
						months = 01;
					}
				}	
				await page.waitForTimeout(3000);
				function splitStr(str) {
					const monthDate = str.split(" ")[2];
					global.monthDate1 = monthDate.split("/")[1];
				}
				splitStr(extractedText2); 

				if(((constCode == true && monthDate1 == months) && constExtension == true)){
					await page.waitForTimeout(1000);
					await page.click('#table_id_wrapper > #table_id > tbody > tr:nth-child('+(i)+') > td > small > a');
					await page.waitForTimeout(1000);
					await page.click('.ultimas_noticias > table > tbody > tr > td > p > a');
					await page.waitForTimeout(1000);
					const url1 = page.url();
					const raspar = new Crawler({
						callback: function (error, res, done) {
							if (error) {
								console.log(error.message);
							} else {
								const groupName = PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\'+ user[6];
								const enterpriseName = PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\'+ user[6] + '\\' + user[7];
								CreateFolderIfItDoesNotExists(groupName);
								CreateFolderIfItDoesNotExists(enterpriseName);
								if(isDateValid || isOtherDateValid){
										fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - FATURA ' + user[1] + '.pdf', res.body, function (err) {
											if (err) console.log(err.message);
										});
										fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\problem-fatura-saude-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
											if (err)
												console.log(err.message);
										});	
								}else{
									fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - FATURA ' + user[1] + '.pdf', res.body, function (err) {
										if (err) console.log(err.message);
									});
									fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\problem-fatura-saude-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
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
				else if((constCode !== true || monthDate1 !== months)){
					continue;
				}
				else{
					break;
				}
			}
		}
		catch(error7)
		{
			if (error7) {
				console.log(error7.message);
			}
			fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingHealthPDF + '\\problem-fatura-saude-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally { page.close() }
	}
}