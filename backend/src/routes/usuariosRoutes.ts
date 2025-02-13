import { Router} from "express";
import usuarioController from "../controllers/usuariosControllers";

class UsuariosRoutes{
    public router:Router=Router();

    constructor(){
        this.config();
    }
    
    config():void{
        this.router.get('/',usuarioController.list);
        this.router.post('/',usuarioController.create);
        this.router.delete('/:Id',usuarioController.delete);
        this.router.put('/:Id',usuarioController.update);

        this.router.post('/login', usuarioController.login); // Iniciar sesión
        this.router.post('/request-password-reset', usuarioController.requestPasswordReset); 
        this.router.post('/registro', usuarioController.create);

    }

    
}
const usuariosRoutes=new UsuariosRoutes();
export default usuariosRoutes.router;
    
