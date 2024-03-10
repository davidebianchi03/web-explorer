export type ChildItem = {
    // key: number,
    name: string,
    is_directory: boolean,
    absolute_path: string,
    parent: string,
    permissions: string,
    modification_time: string,
    size: number,
    editable: boolean,
    children: ChildItem[]
}