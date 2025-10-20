import { Document, HydratedDocument ,Types , model} from "mongoose"
// import { generateHash } from "../../common/utils/Security/Hash";
// import { emailEvent } from "../../utils/Events/email";
import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { GenderEnum,  ProviderEnum, RoleEnum } from "src/common/enums";
import { OtpDocument } from "./otp.model";
import { generateHash } from "src/common";



@Schema({timestamps:true,
  strictQuery:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})
export class User {
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

  // @Prop({type:Boolean})
  // resetPassword:boolean;
  // @Prop({type:Boolean})
  // resetEmail:boolean;
  // @Prop({type:String , enum : GenderEnum, default:GenderEnum.male})
  // freezeAt?:Date;
  // @Prop({type:String , enum : GenderEnum, default:GenderEnum.male})
  // freezeBy:Types.ObjectId;
  // @Prop({type:String , enum : GenderEnum, default:GenderEnum.male})
  // restoreAt?:Date;
  // @Prop({type:String , enum : GenderEnum, default:GenderEnum.male})
  // restoreBy:Types.ObjectId;
  // @Prop({type:String})
  // tempEmail?:string;
  // @Prop({type:Boolean})
  // twoFactorEnabled:boolean;
  // @Prop({type:String})
  // twoFactorOTP:string;
  // @Prop({type:Date})
  // twoFactorExpires:Date; 
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


// userSchema.pre("save" , async function(this:HUserDocument & {wasNew:boolean ,
//    confirmEmailPlainOtp:string},next
// ) {
//   this.wasNew = this.isNew
//   if (this.isModified("password")) {
//     this.password = await generateHash({plaintext:this.password})
//   }
//   if (this.isModified("emailOTP")) {
//     this.confirmEmailPlainOtp = this.emailOTP as string
//     this.emailOTP = await generateHash({plaintext:this.emailOTP as string})
//   }
//   next()
// })


// userSchema.post("save" , async function (doc , next) {
//   const that  = this as HUserDocument & {wasNew:boolean , confirmEmailPlainOtp:string}
//   if (that.wasNew && that.confirmEmailPlainOtp) {
//     emailEvent.emit("Confirm Email", { to: this.email, otp: that.confirmEmailPlainOtp }); 
//   }
//   next()
// })



// userSchema.post("findOneAndUpdate", async function (doc) {
//     if (!doc) return;
//     const prev = await this.model.findOne(this.getQuery()).select("role email");
//     if (prev && prev.role !== doc.role && doc.email) {
//       emailEvent.emit("Role Changed", {
//         to: doc.email,
//         otp: `Your role has been changed to ${doc.role}`,
//       });
//     }
// });



// userSchema.pre(["find" , "findOne"] , function(next){
//   const query = this.getQuery()
//   if (query.paranoid === false) {
//     delete query.paranoid
//     this.setQuery({ ...query })
//   } else {
//     delete query.paranoid
//     this.setQuery({ ...query, freezedAt: { $exists: false } })
//   }
//   next()
// })


export const UserModel = MongooseModule.forFeature([
  {name:User.name , schema:userSchema}
])
