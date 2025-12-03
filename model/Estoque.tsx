export class Estoque {
    public id: string;
    public nome: string;
    public codigo: string;
    public qtd: number; 

    constructor(obj?: Partial<Estoque>) {
        if (obj) {
            this.id = obj.id || '';
            this.nome = obj.nome || '';
            this.codigo = obj.codigo || '';
            this.qtd = obj.qtd || 0;
        }
    }

    toString() {
        const objeto = `{
            "id": "${this.id}",
            "nome": "${this.nome}",
            "codigo": "${this.codigo}",
            "qtd": ${this.qtd}
        }`;
        return objeto;
    }

    
    toFirestore() {
        const produto = {
            nome: this.nome,
            codigo: this.codigo,
            qtd: this.qtd
        };
        return produto;
    }
}