import './FileExplorer.css';
import { Component } from "react";
import enter_icon from '../img/enter.svg';
import DataTable from 'react-data-table-component';
import { GetChildrenElements } from '../http-requests/http-requests';

export class FileExplorer extends Component {
    constructor(props) {
        super(props);
        this.connection = props.connection;
        this.state = {
            path: "/",
            items: [],
        }
    }

    componentDidMount() {
        this.updateChildrenElements();
    }

    updateChildrenElements(){
        if (this.connection) {
            (async () => {
                let response = await GetChildrenElements(this.connection.id, this.state.path === '' ? '/' : this.state.path);
                if (!response.error) {
                    let children = [];
                    for (let i = 0; i < response.data.children.length; i++) {
                        let child = response.data.children[i];
                        children.push({
                            icon: '',
                            name: child.name,
                            type: child.type,
                            last_modified: child.last_modified,
                            size: child.size
                        });
                    }
                    this.setState({ items: children });
                } else {
                    alert('Error')
                }
            })();
        } else {
            alert('Error')
        }
    }

    render() {
        let columns = [
            {
                name: '',
                selector: row => row.icon,
                width: "25px",
                style: {
                    height: 25
                }
            },
            {
                name: 'Name',
                selector: row => row.name,
                sortable: true,
                style: {
                    fontWeight: 500,
                }
            },
            {
                name: 'Type',
                selector: row => row.type,
                sortable: true,
            },
            {
                name: 'Last Modified',
                selector: row => row.last_modified,
                sortable: true,
            },
            {
                name: 'Size',
                selector: row => row.size,
            },
        ]

        const CustomStyle = {
            rows: {
                style: {
                    minHeight: '28px !important',
                    fontSize: '12px',
                    whiteSpace: 'pre',
                },
            },
            headRow: {
                style: {
                    minHeight: '30px',
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderBottomWidth: '2px',
                },
            },
        };
        return (
            <div className="file-explorer">
                <div className='header'>
                    <div className='buttons'></div>
                    <div className='path-input'>
                        <input type="text" value={this.state.value} />
                        <img src={enter_icon} alt='Enter' />
                    </div>
                </div>
                <div>
                    <DataTable
                        columns={columns}
                        data={this.state.items}
                        customStyles={CustomStyle}
                        onRowDoubleClicked={(row) => this.openChild(row)}
                    />
                </div>
            </div>
        )
    }

    openChild(row) {
        let new_path = this.state.path[this.state.path.length - 1] === '/' ? '' : '/' + row.name;
        this.setState({ path: new_path });
        this.updateChildrenElements();
    }
}