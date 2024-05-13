/// <reference types="cypress" />

class Consulta {
    acessarSite() {
        cy.visit("https://www42.bb.com.br/portalbb/daf/beneficiario,802,4647,4652,0,1.bbx");
    }
  
    realizarConsulta(nomeCidade) {
        cy.get('#formulario\\:txtBenef').type(nomeCidade);
        cy.get('[name="formulario:j_id16"]').click();
    }
  
    definirFundo() {
        cy.get('#formulario\\:comboFundo').select('51');
    }
  
    definirData(dataInicial, dataFinal) {
        cy.get('#formulario\\:dataInicial').clear().type(dataInicial);
        cy.get('#formulario\\:dataFinal').clear().type(dataFinal);
        cy.wait(1000);
        cy.get('[name="formulario:j_id20"]', { timeout: 10000 }).click();
    }
  
    async extrairData(anoMes) {
      cy.wait(500);
      try {
          cy.get('#formulario\\:demonstrativoList\\:2\\:subTableLancamentos\\:2\\:j_id41 > .extratoValorPositivo', {timeout: 10000})
              .should('be.visible')
              .then((valor) => {
                  cy.log(valor);
                  const valorLimpo = valor.text().replace(/[^0-9,]/g, "");
                  cy.log(valorLimpo);
                  const linhaNova = '\n' + anoMes + '\t' + valorLimpo;
                  cy.log(linhaNova);
                  this.salvarDadosEmCSV(linhaNova);
              });
      } catch (error) {
          console.error('Erro ao extrair data da tela:', error.message);
          throw error;
      }
  }
  
  async salvarDadosEmCSV(linhaNova) {
    try {
        let conteudoCsv = "";

        
        await cy.readFile('jacarau.csv').then((linhasArquivo) => {
            // Verifica se o arquivo existe e se contem os titulos "DATA" e "VALOR"
            if (!linhasArquivo || !linhasArquivo.includes('DATA\tVALOR')) {
                // Se o arquivo nao existir ou nao contiver os titulos, cria o cabeçalho com as colunas fixas
                conteudoCsv = 'DATA\tVALOR\n';
            } else {
                // Se o arquivo existir e contiver os titulos, vai manter o conteudo
                conteudoCsv = linhasArquivo;
            }

            // Adiciona a nova linha ao conteúdo CSV
            conteudoCsv += linhaNova;

            cy.writeFile('jacarau.csv', conteudoCsv);
            cy.log('Dados salvos com sucesso no arquivo pedroregis.csv');
        });
    } catch (error) {
        cy.log(`Erro ao salvar os dados no arquivo CSV: ${error.message}`);
        throw error;
    }
}

  
  }
  function diasNoMes(mes, ano) {
    return new Date(ano, mes, 0).getDate();
  }
  
  
  describe('teste de consulta de varios meses ou anos', () => {
    const consulta = new Consulta();
    const anos = [2022, 2023];
    const cidade = 'Jacarau'
  
    it('realizando consulta', () => {
        anos.forEach((ano) => {
            for (let mes = 1; mes <= 12; mes++) {
                const dataInicial = `01/${mes < 10 ? '0' + mes : mes}/${ano}`;
                const ultimoDiaDoMes = diasNoMes(mes, ano);
                const dataFinal = `${ultimoDiaDoMes < 10 ? '0' + ultimoDiaDoMes : ultimoDiaDoMes}/${mes < 10 ? '0' + mes : mes}/${ano}`;
  
                consulta.acessarSite();
                consulta.realizarConsulta(cidade);
                consulta.definirFundo();
                consulta.definirData(dataInicial, dataFinal);
                consulta.extrairData(`${ano}${mes < 10 ? '0' + mes : mes}`);
            }
        });
    });
  });