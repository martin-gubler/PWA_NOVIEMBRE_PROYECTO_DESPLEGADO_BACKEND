import ResponseBuilder from "../utils/builders/response.Builder.js"


export const getPingController = (req, res) => {
    
    try{
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Succes')
        .setPayload({
            message: 'Pong'
        })
        .build()
        return res.status(200).json(response)
    }
    catch(error){
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal server error')
        .setPayload({
            detail: error.message
        })
        .build()
        return res.status(500).json(response)
    }
}