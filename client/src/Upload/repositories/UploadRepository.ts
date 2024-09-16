import {Repository} from "../../repository/Repository";
import {Upload} from "../../api/types/response";

export interface UploadRepository extends Repository<Upload<any>, {}> {

}
