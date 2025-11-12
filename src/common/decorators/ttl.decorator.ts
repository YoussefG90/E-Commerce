import { SetMetadata } from "@nestjs/common"

export const TTLNAME = "TTLNAME"
export const TTL = (expire:number) => {
       return SetMetadata(TTLNAME,expire)
}