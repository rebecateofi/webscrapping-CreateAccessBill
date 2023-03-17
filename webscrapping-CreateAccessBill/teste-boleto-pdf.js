// Carrega o arquivo PDF
PDFJS.getDocument('C:\Faturas-automatizado\Envio 15 Saude\Boleto Saúde PDF\AGIL PUBLICIDADE LTDA\AGIL COMUNICACAO E MARKETING LTDA\3 - BOLETO 07GDD.pdf').then(function(pdf) {
	// Obtém o número de páginas do PDF
	var numPages = pdf.numPages;
	
	// Loop através de todas as páginas do PDF
	for (var i = 1; i <= numPages; i++) {
	  // Obtém o objeto de página atual
	  pdf.getPage(i).then(function(page) {
		// Obtém o conteúdo do texto da página
		page.getTextContent().then(function(textContent) {
		  // Loop através de todas as linhas de texto da página
		  for (var j = 0; j < textContent.items.length; j++) {
			// Obtém o texto da linha atual
			var text = textContent.items[j].str;
			
			// Faz algo com o texto (exemplo: exibe na tela)
			console.log(text);
		  }
		});
	  });
	}
  });
  