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
	app.listen(3051, async () => {
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
		var typing = 'Teste';
		
		CreateFolderIfItDoesNotExists('C:\\Faturas-automatizado\\' + typing);

		try {
			await page.goto('https://webhap.hapvida.com.br/pls/webhap/webNewTrocaArquivo.login');
			await page.waitForTimeout('input[name="pCpf"]');
			await page.type('input[name="pCpf"]', user[8], { delay: 0 });
			await page.type('input[name="pSenha"]', user[2], { delay: 00 });
			await page.keyboard.press('Enter');
			await page.waitForTimeout(1000);
			await page.click('.ultimas_noticias > table > tbody > tr > td > strong > small > a');
			await page.waitForTimeout(1000);
			await page.click('#table_id_wrapper > #table_id > tbody > tr:nth-child(2) > td > small > a');
			await page.waitForTimeout(1000);
			await page.click('.ultimas_noticias > table > tbody > tr > td > p > a');
			await page.waitForTimeout(1000);
			var dateNow = new Date();
			const url1 = page.url();
			const raspar = new Crawler({
				callback: function (error, res, done) {
					if (error) {
						console.log(error.message);
					} else {
						
                        var groupName = 'C:\\Faturas-automatizado\\' + typing + '\\' + user[6];
						var enterpriseName = 'C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7];
                        var sendDate = user[9];
						if (fs.existsSync(groupName)) {
							if(fs.existsSync(enterpriseName)){
								if(sendDate == '20' || sendDate == '25' || sendDate == '1' ){
									fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) + ' - FATURA ' + user[0] + '.pdf', res.body, function (err) {
										if (err) console.log(err.message);
									});
								}else{
									fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) + ' - FATURA ' + user[0] + '.pdf', res.body, function (err) {
										if (err) console.log(err.message);
									});
								}
							}
						}
						else if (!fs.existsSync(groupName))
						{
                            fs.mkdirSync(groupName);
							if(!fs.existsSync(enterpriseName))
							{
								fs.mkdirSync(enterpriseName);
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
                        }			
					}
					done();
				}
			});
			raspar.queue(url1);
		}
		catch
		{
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem.txt', user[0] + " - " + user[7] + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally { page.close() }
	}
}