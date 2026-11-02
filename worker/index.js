import {DurableObject} from 'cloudflare:workers';
import {FamilyAuth as AuthService} from './auth.js';
export class FamilyAuth extends DurableObject {
constructor(ctx,env){super(ctx,env);this.auth=new AuthService(ctx,env)}
fetch(request){return this.auth.fetch(request)}
alarm(){return this.auth.alarm()}
}
export {default} from './router.js';
