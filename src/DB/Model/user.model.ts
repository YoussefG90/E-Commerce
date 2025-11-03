import { HydratedDocument ,Types} from "mongoose"
import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { GenderEnum,  ProviderEnum, RoleEnum } from "src/common/enums";
import { OtpDocument } from "./otp.model";
import { generateHash, IProduct } from "src/common";
import { IUser } from "src/common/interfaces/user.interface";



@Schema({timestamps:true,
  strictQuery:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})
export class User implements IUser {
  @Prop({type :String , required:true , minlength:2 , maxlength:25})
  firstName:string
  @Prop({type :String , required:true , minlength:2 , maxlength:25})
  lastName: string;
  @Virtual({
    get:function(this:User) {
  return this.firstName + " " + this.lastName;
    } ,
    set:function (value:string) {
  const [firstName , lastName] = value.split(" ") || [];
  this.set({firstName,lastName});
    }
  })
  userName:string;
  @Prop({type :String , required:true, unique:true})
  email: string;
  @Prop({type:String,required:function(){return this.provider === ProviderEnum.System ? true : false}})
  password:string;
  @Prop({type:String , enum:ProviderEnum , default: ProviderEnum.System})
  provider:ProviderEnum;
  @Prop({type:String , enum : GenderEnum, default:GenderEnum.male})
  gender:GenderEnum;
  @Prop({type :Number , required:true})
  age:number; 
  @Prop({type :String})
  phone?:string;
  @Prop({type:String , enum : RoleEnum, default:RoleEnum.user})
  role:RoleEnum; 
  @Prop({type:Date})
  changeCredentialsTime:Date;
  @Virtual()
  otp:OtpDocument[]
  @Prop({type:Boolean})
  confirmEmail:boolean;

  @Prop({ default: null })
  profileImage?: string;
  @Prop({ default: null })
  profileImagePublicId?: string;
  @Prop({type:[{type:Types.ObjectId ,ref:'Produt'}]})
  wishlist?: Types.ObjectId[]
}

export type UserDocument = HydratedDocument<User>
export const userSchema = SchemaFactory.createForClass(User)

userSchema.virtual('otp',{
  localField:'_id',
  foreignField:'createdBy',
  ref:'OTP'
})

userSchema.pre("save" , async function(next){
  if (this.isModified('password')) {
    this.password = await generateHash(this.password)
  }
  next()
})




export const UserModel = MongooseModule.forFeature([
  {name:User.name , schema:userSchema}
])
