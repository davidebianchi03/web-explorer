import prisma from "./prisma";
import express, { Request, Response, NextFunction } from 'express';

/**
 * Middleware used to redirect user to login page if it's not logged in 
 */
export async function LoginMiddleware(req:Request, res:Response, next:NextFunction) {
    if(!req.url.startsWith("/auth")){
        if(req.cookies.session_id){
            var session = await prisma.session.findFirst({
                where: {
                    id: req.cookies.session_id
                }
            });
            if(session != null){
                next();
                return;
            }
        }    
    } else {
        next();
        return;
    }
    res.redirect("/auth/login");
}