export class Manutencao {
    public id: string;
    public cliente: string;
    public telefone: string;
    public veiculo: string;
    public servico: string;
    public status: string; 
    public data: any;      

    constructor(obj?: Partial<Manutencao>) {
        if (obj) {
            this.id = obj.id || '';
            this.cliente = obj.cliente || '';
            this.telefone = obj.telefone || '';
            this.veiculo = obj.veiculo || '';
            this.servico = obj.servico || '';
            this.status = obj.status || 'Agendado';
            this.data = obj.data || new Date();
        }
    }

    
    toString() {
        const objeto = `{
            "id": "${this.id}",
            "cliente": "${this.cliente}",
            "telefone": "${this.telefone}",
            "veiculo": "${this.veiculo}",
            "servico": "${this.servico}",
            "status": "${this.status}",
            "data": "${this.data}"
        }`
        return objeto;
    }

  
    toFirestore() {
        const manutencao = {
            cliente: this.cliente,
            telefone: this.telefone,
            veiculo: this.veiculo,
            servico: this.servico,
            status: this.status,
            data: this.data
        }
        return manutencao;
    }
}