import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container:{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    inputContainer: {
        width: '80%',
        alignItems: "center",
        justifyContent: "center"
    },
    input:{
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: "100%"
    },

    buttonContainer: {
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40
    },
    button: {
        backgroundColor: '#06b8b8',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10
    },
    buttonText:{
        color: 'white',
        fontWeight: '700',
        fontSize: 15
    },
    buttonOutline: {
        backgroundColor: 'white',
        borderColor: '#06b8b8',
        borderWidth: 2
    },
    buttonOutlineText: {
        color: '#06b8b8'
    },

    //FLATLIST
    item: {
        backgroundColor: 'white',
        borderColor: '#06b8b8',
        borderWidth: 2,
        borderRadius: 15,
        padding: 20,
        marginVertical: 10,
        flexDirection: 'row',
        columnGap: 10
    },
    detalhes: {
        flexDirection: 'column'
    },
    titulo: {
        fontSize: 18,
        color: '#06b8b8',
        fontWeight: 500
    },

    foto: {
        height: 200,
        width: 200,
        borderRadius: 100, 
        marginBottom: 30       
    },
    fotoListar: {
        height: 120,
        width: 120,
        borderRadius: 10
    }
});