const puppeteer = require('puppeteer');
const Crawler = require('crawler');
const fs = require("fs");
const express = require("express");
const { IsApplicationBlocked } = require("./utility/functions");

{
	const app = express()
	app.get('/', (req, res) => {
		res.send('Aplicação rodando');
	})
	app.listen(3050, async () => {
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
		var typing = 'Copay Saúde PDF';
		if (!fs.existsSync('C:\\Faturas-automatizado\\' + typing)) {
			fs.mkdirSync('C:\\Faturas-automatizado\\' + typing);
		}
		try {
			await page.goto('https://webhap.hapvida.com.br/pls/webhap/webNewTrocaArquivo.login');
			await page.waitForTimeout('input[name="pCpf"]');
			await page.type('input[name="pCpf"]', user[8], { delay: 0 });
			await page.type('input[name="pSenha"]', user[2], { delay: 00 });
			await page.keyboard.press('Enter');
			await page.waitForTimeout(1000);
			await page.click('.ultimas_noticias > table > tbody > tr > td > strong > small > a');
			await page.waitForTimeout(1000);
			try{
			for(var i=3; i<=9; i++){
				var extractedText1 = await page.$eval('#table_id > tbody > tr:nth-child('+i+') > td.sorting_1 > small > a', (el) => el.innerText);
				const substring = 'FM';
				const constFm = extractedText1.includes(substring);
				console.log(constFm);
				console.log(extractedText1);
				if(constFm !== true){

					var extractedText2 = await page.$eval('.ultimas_noticias > #table_id_wrapper > #table_id_paginate > span > .paginate_button:nth-child(2)')
					
					if(extractedText2 == true){
						var extractedText1 = await page.$eval('#table_id > tbody > tr:nth-child('+i+') > td.sorting_1 > small > a', (el) => el.innerText);
						constFm = true;
					}
					await page.click('#table_id > tbody > tr:nth-child('+(i+1)+') > td.sorting_1 > small > a');
					await page.waitForTimeout(1000);
					await page.click('.ultimas_noticias > table > tbody > tr > td > p > a');
					await page.waitForTimeout(1000);
					const dateNow = new Date();
					const url1 = page.url();
					const raspar = new Crawler({
						callback: function (error, res, done) {
							if (error) {
								console.log(error.message);
							} else {
								var groupName = 'C:\\Faturas-automatizado\\' + typing + '\\' + user[6];
								var enterpriseName = 'C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7];
								var sendDate = user[9];
								if (!fs.existsSync(groupName)){
									fs.mkdirSync(groupName);
								}
								if(!fs.existsSync(enterpriseName)){
									fs.mkdirSync(enterpriseName);
								}
								if(sendDate == '20' || sendDate == '25' || sendDate == '1'){
									fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - FATURA ' + user[0] + '.pdf', res.body, function (err) {
										if (err) console.log(err.message);
									});
								}else{
									fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - FATURA ' + user[0] + '.pdf', res.body, function (err) {
										if (err) console.log(err.message);
									});
								}
							}
							done();
						}
					});
					raspar.queue(url1);
				}else{

					continue;
				}
			}
		}	catch (erroriss) {
			if (erroriss) {
				console.log(erroriss.message);
			}
		}
		}
		catch
		{
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-copay-saude-pdf.txt', user[0] + " - " + user[7] + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally { page.close() }
	}
}