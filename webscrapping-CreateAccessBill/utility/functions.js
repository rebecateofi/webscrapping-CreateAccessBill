const fs = require("fs");

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

function CreateFolderIfItDoesNotExists(folderName)
{
	if (!fs.existsSync(folderName))
		fs.mkdirSync(folderName);
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

module.exports = {
	IsApplicationBlocked,
	CreateFolderIfItDoesNotExists
  };
  