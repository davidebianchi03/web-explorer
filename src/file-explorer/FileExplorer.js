import './FileExplorer.css';
import { Component } from "react";
import enter_icon from '../img/enter.svg';
import DataTable from 'react-data-table-component';

export class FileExplorer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            path: "/",
            items: [],
        }
        this.state.items = [
            {
                icon: '',
                file_name:'Test',
                type: 'Folder',
                last_change:'2022/12/03 - 12:18',
                permissions: 'rwx'
            }
        ]
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
                name: 'File name',
                selector: row => row.file_name,
                sortable: true,
            },
            {
                name: 'Type',
                selector: row => row.type,
                sortable: true,
            },
            {
                name: 'Last change',
                selector: row => row.last_change,
                sortable: true,
            },
            {
                name: 'Permissions',
                selector: row => row.permissions,
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
                    />
                </div>
            </div>
        )
    }
}