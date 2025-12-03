export class Fornecedor {
    public id: string;
    public nome: string;
    public telefone: string;
    public especialidade: string;
    public endereco: string;

    constructor(obj?: Partial<Fornecedor>) {
        if (obj) {
            this.id = obj.id;
            this.nome = obj.nome;
            this.telefone = obj.telefone;
            this.especialidade = obj.especialidade;
            this.endereco = obj.endereco;
        }
    }

    toString() {
        const objeto = `{
            "id": "${this.id}",
            "nome": "${this.nome}",
            "telefone": "${this.telefone}",
            "especialidade": "${this.especialidade}",
            "endereco": "${this.endereco}"
        }`
        return objeto;
    }

    toFirestore() {
        const fornecedor = {
            id: this.id,
            nome: this.nome,
            telefone: this.telefone,
            especialidade: this.especialidade,
            endereco: this.endereco
        }
        return fornecedor;
    }
}