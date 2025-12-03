export class Usuario {
    public id: string;
    public nome: string;
    public email: string;
    public nivel: string; 

    constructor(obj?: Partial<Usuario>) {
        if (obj) {
            this.id = obj.id || '';
            this.nome = obj.nome || '';
            this.email = obj.email || '';
            this.nivel = obj.nivel || 'Restrito';
        }
    }


    toString() {
        const objeto = `{
            "id": "${this.id}",
            "nome": "${this.nome}",
            "email": "${this.email}",
            "nivel": "${this.nivel}"
        }`
        return objeto;
    }

    
    toFirestore() {
        const usuario = {
            nome: this.nome,
            email: this.email,
            nivel: this.nivel
        }
        return usuario;
    }
}