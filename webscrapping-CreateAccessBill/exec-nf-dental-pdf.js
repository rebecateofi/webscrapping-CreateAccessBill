const puppeteer = require('puppeteer');
const fs = require("fs");
const express = require("express");
const { PASTA_GERAR_FATURA_AUTOMATIZADA, ARQUIVO_ACESSOS, userDir, typingNFDentalPDF, dateNow, months, day } = require("./utility/constants");
const { IsApplicationBlocked, CreateFolderIfItDoesNotExists } = require("./utility/functions");

{
	const app = express()
	app.get('/', (req, res) => {
		res.send('Aplicação rodando');
	})
	app.listen(3053, async () => {
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
		CreateFolderIfItDoesNotExists(PASTA_GERAR_FATURA_AUTOMATIZADA + typingNFDentalPDF);
		try {
			await page.goto('https://www.hapvida.com.br/pls/podontow/webNewDentalEmpresarial.pr_login_empresa_opmenu?pOpMenu=4');
			await page.waitForTimeout(3000);
			await page.waitForTimeout('input[name="pCodigoEmpresa"]');
			await page.type('input[name="pCodigoEmpresa"]', user[0], { delay: 100 });
			await page.type('input[name="pSenha"]', user[3], { delay: 100 });

			await page.waitForTimeout(3000);
			await page.keyboard.press('Enter');
            await page.waitForTimeout(4000);
			for(var i=0; i<=9; i++){
				var extractedText1 = await page.$eval('.table-rel > tbody > tr:nth-child('+(i+1)+') > td:nth-child(1) > a', (el) => el.innerText);
				const substring = user[1];
				const constFm = extractedText1.includes(substring);
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
							const focus = await pageTarget.$('body > #wrap > #content > #div_visualizacao_normal_id > .container-fluid');
							if (focus !== null) {
								await pageTarget.waitForTimeout(3000);
								await pageTarget.waitForSelector('#j_id32\\:panelAcoes > tbody > tr > .col > .btn')
								await pageTarget.click('#j_id32\\:panelAcoes > tbody > tr > .col > .btn')
								await pageTarget.waitForTimeout(6000);
								var groupName = PASTA_GERAR_FATURA_AUTOMATIZADA + typingNFDentalPDF + '\\'+ user[6];
								var enterpriseName = PASTA_GERAR_FATURA_AUTOMATIZADA + typingNFDentalPDF + '\\'+ user[6] + '\\' + user[7];
								var sendDate = user[9];
								const isDateValid = (sendDate == '20' || sendDate == '25') && day >= 16;
								const isOtherDateValid = (sendDate == '1' || sendDate == '5') && day > 25;
				
								CreateFolderIfItDoesNotExists(groupName);
								CreateFolderIfItDoesNotExists(enterpriseName);
								if(isDateValid || isOtherDateValid){
									fs.rename(userDir +'\\relatorio.pdf', PASTA_GERAR_FATURA_AUTOMATIZADA  + typingNFDentalPDF + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+2) +' - NOTA FISCAL ' + user[1] + '.pdf', function(err) {
										if ( err ) console.log('ERROR: ' + err);
									});
									fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingNFDentalPDF + '\\problem-nf-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
										if (err)
											console.log(err.message);
									});	
								}else{
									await pageTarget.waitForTimeout(3000);
									fs.rename(userDir +'\\relatorio.pdf', PASTA_GERAR_FATURA_AUTOMATIZADA  + typingNFDentalPDF + '\\' + user[6] + '\\' + user[7] + '\\' + (dateNow.getMonth()+1) +' - NOTA FISCAL ' + user[1] + '.pdf', function(err) {
										if ( err ) console.log('ERROR: ' + err);
									});
									fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingNFDentalPDF + '\\problem-nf-dental-pdf.txt', user[1] + " - " + user[7] + " - OK" + "\r\n", function (err) {
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
			fs.appendFile(PASTA_GERAR_FATURA_AUTOMATIZADA + typingNFDentalPDF + '\\problem-nf-dental-pdf.txt', user[1] + " - " + user[7] + " - ERRO" + "\r\n", function (err) {
				if (err)
					console.log(err.message);
			});
		}
		finally { page.close() }
	}
}
