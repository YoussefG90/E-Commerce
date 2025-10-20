import {compare , hash} from 'bcrypt'


export const generateHash = async (
     plaintext:string,
     saltRounds:number = parseInt(process.env.SALT as string || "12")
  ) : Promise<string> => {
    return await hash (plaintext ,saltRounds)
} 

export const compareHash = async (plaintext:string, value:string): Promise<boolean> => {
    return await compare (plaintext ,value)
} 