export function PadWithZero(number:number):string{

    let number_str = number.toString()

    if (number_str.length === 1) {
        return '0' + number_str;
    }
    return number_str;
}

export function FixPath(path:string):string{
    if(path !== "")
        return path[path.length-1] === "/" ? path : (path + "/");
    return "/";
}