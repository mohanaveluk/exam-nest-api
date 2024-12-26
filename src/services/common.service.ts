import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonService {
    isNullOrEmpty(value){
        return value === undefined || value === null || value === '';
    }
}