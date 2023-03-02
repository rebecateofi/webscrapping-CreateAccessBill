const puppeteer = require('puppeteer');
const fs = require("fs");
const express = require("express");
{
	const app = express()
	app.get('/', (req, res) => {
		res.send('Aplicação rodando');
	})
	app.listen(3053, async () => {
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
		var typing = 'Nota Fiscal Dental PDF';
		if (!fs.existsSync('C:\\Faturas-automatizado\\' + typing)) {
			fs.mkdirSync('C:\\Faturas-automatizado\\' + typing);
		}
		try {
			await page.goto('https://www.hapvida.com.br/pls/podontow/webNewDentalEmpresarial.pr_login_empresa_opmenu?pOpMenu=4');
			await page.waitForTimeout(3000);
			await page.waitForTimeout('input[name="pCodigoEmpresa"]');
			await page.type('input[name="pCodigoEmpresa"]', user[0], { delay: 100 });
			await page.type('input[name="pSenha"]', user[3], { delay: 100 });
			await page.waitForTimeout(3000);
			await page.keyboard.press('Enter');
			//user[2], 96301 475271
            await page.waitForTimeout(4000);
			for(var i=0; i<=9; i++){
				var extractedText1 = await page.$eval('.table-rel > tbody > tr:nth-child('+(i+1)+') > td:nth-child(1) > a', (el) => el.innerText);
				const substring = user[1];
				const constFm = extractedText1.includes(substring);
				console.log(substring);
				console.log(constFm);
				console.log(extractedText1);
				if(constFm == true){
					await page.click('.table-rel > tbody > tr:nth-child('+(i+1)+') > td:nth-child(1) > a');
					await page.waitForTimeout(3000);			
					const extractedText = await page.$eval('.ultimas_noticias > #div2 > small > #dialog-modal > p', (el) => el.innerText);
					await page.waitForTimeout(3000);
					function splitStr(str) {
						const nfse = str.split("*:")[1];
						global.nfse1 = nfse.split("\n")[0];
						const code = str.split("*:")[2];
						global.code1 = code.split("\n")[0];
						const cnpj = str.split("*:")[3];
						global.cnpj1 = cnpj.split("\n")[0];
					}
					splitStr(extractedText);  
					await page.waitForTimeout(3000);			
					await page.goto('https://iss.fortaleza.ce.gov.br/');
					await page.waitForTimeout(3000);
					await page.click('#content > #login > .col-lg-10 > .form-signin > .div-up:nth-child(15)');
					await page.waitForTimeout(3000);
					try{
						await page.waitForTimeout(3000);
						await page.type('input[name="validarNotaForm:numNfse"]', nfse1, { delay: 100 });
						await page.type('input[name="validarNotaForm:numCodVerificacao"]', code1, { delay: 100 });
						await page.type('input[name="validarNotaForm:nfseCnpjPrestador"]', cnpj1, { delay: 100 });
						await page.waitForTimeout(3000);
						await page.keyboard.press('Enter');
						await page.waitForTimeout(3000);
					}
					catch (erroriss) {
						if (erroriss) {
							console.log(erroriss.message);
						}
					}
					const pages = await browser.pages();
					for (const pageTarget of pages) {
						try {
							await pageTarget.waitForTimeout(3000);
							var dateNow = new Date();
							var day = dateNow.getDay();
							const focus = await pageTarget.$('body > #wrap > #content > #div_visualizacao_normal_id > .container-fluid');
							if (focus !== null) {
								await pageTarget.waitForTimeout(3000);
								await pageTarget.waitForSelector('#j_id32\\:panelAcoes > tbody > tr > .col > .btn')
								await pageTarget.click('#j_id32\\:panelAcoes > tbody > tr > .col > .btn')
								await pageTarget.waitForTimeout(6000);
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
									fs.rename('C:\\users\\user\\downloads\\relatorio.pdf', 'C:\\Faturas-automatizado\\'  + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) +' - NOTA FISCAL ' + user[1] + '.pdf', function(err) {
										if ( err ) console.log('ERROR: ' + err);
									});
									fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-nf-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
										if (err)
											console.log(err.message);
									});	
								}else{
									await pageTarget.waitForTimeout(3000);
									fs.rename('C:\\users\\user\\downloads\\relatorio.pdf', 'C:\\Faturas-automatizado\\'  + typing + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) +' - NOTA FISCAL ' + user[1] + '.pdf', function(err) {
										if ( err ) console.log('ERROR: ' + err);
									});
									fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-nf-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
										if (err)
											console.log(err.message);
									});	
								}
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
					break;
				}
			}
		}
		catch
		{
			fs.appendFile('C:\\Faturas-automatizado\\' + typing + '\\problem-nf-dental-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally { page.close() }
	}
}
async function IsApplicationBlocked(message) {
	var limitDate = new Date("2023-12-03T00:00:00");
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