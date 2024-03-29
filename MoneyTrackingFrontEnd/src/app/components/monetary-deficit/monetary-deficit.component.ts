import { Component, OnInit, ViewChild } from '@angular/core';
import { MonetaryDeficitDeleteComponent } from './monetary-deficit-delete/monetary-deficit-delete.component';
import { MonetaryDeficitViewComponent } from './monetary-deficit-view/monetary-deficit-view.component';
import { MonetaryDeficitService } from 'src/app/services/monetary-deficit.service';
import { ToastrService } from 'ngx-toastr';
import { MonetaryDeficit } from 'src/app/models/monetaryDeficit';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-monetary-deficit',
  templateUrl: './monetary-deficit.component.html',
  styleUrls: ['./monetary-deficit.component.scss'],
})
export class MonetaryDeficitComponent implements OnInit {
  jwtHelper: JwtHelperService = new JwtHelperService();
  monetaryDeficit: MonetaryDeficit[] = [];
  displayedColumns: string[] = [
    'date',
    'nameSurname',
    'amount',
    'description',
    'action',
  ];
  dataSource: MatTableDataSource<MonetaryDeficit> =
    new MatTableDataSource<MonetaryDeficit>();
  dataLoaded = false;
  searchHide = false;
  filterText: '';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isAuthenticated: boolean = false;
  userRole: string[] = [];
  add: boolean = false;
  delete: boolean = false;
  update: boolean = false;
  list: boolean = false;

  constructor(
    private monetaryDeficitService: MonetaryDeficitService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.tokenAndUserControl();
    this.getAll();
  }

  tokenAndUserControl() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      let token = localStorage.getItem('token');
      let decode = this.jwtHelper.decodeToken(token);
      let role = Object.keys(decode).filter((x) =>
        x.endsWith('/role')
      )[0];
      this.userRole = decode[role];
    }

    const arrayControl = Array.isArray(this.userRole);
    if (arrayControl == false) {
      if (this.userRole.toString() == 'Admin') {
        this.add = true;
        this.delete = true;
        this.update = true;
        this.list = true;
      }
    }
    else {
      this.userRole.forEach(element => {
        if (element == 'Admin') {
          this.add = true;
          this.delete = true;
          this.update = true;
          this.list = true;
        }
        if (element == 'MonetaryDeficit.Add') {
          this.add = true;
        }
        if (element == 'MonetaryDeficit.Delete') {
          this.delete = true;
        }
        if (element == 'MonetaryDeficit.Update') {
          this.update = true;
        }
        if (element == 'MonetaryDeficit.GetAll') {
          this.list = true;
        }
      });
    }
  }

  filterDataSource() {
    this.dataSource.filter = this.filterText.trim().toLocaleLowerCase();
  }

  getTotalAmount() {
    return this.monetaryDeficit
      .map((t) => t.amount)
      .reduce((acc, value) => acc + value, 0);
  }

  getAll() {
    this.monetaryDeficitService.getAll().subscribe(
      (response) => {
        this.monetaryDeficit = response.data;
        this.dataSource = new MatTableDataSource<MonetaryDeficit>(
          this.monetaryDeficit
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataLoaded = true;
      },
      (responseError) => {
        this.toastrService.error(responseError.data.message, 'Dikkat');
      }
    );
  }

  openAddDialog() {
    this.dialog
      .open(MonetaryDeficitViewComponent, {
        width: '400px',
        data: { status: true },
      })
      .afterClosed()
      .subscribe((value) => {
        if (value === 'save') {
          this.getAll();
        }
      });
  }

  openEditDialog(row: any) {
    this.dialog
      .open(MonetaryDeficitViewComponent, {
        width: '400px',
        data: { status: false, row },
      })
      .afterClosed()
      .subscribe((value) => {
        if (value === 'update') {
          this.getAll();
        }
      });
  }

  openDeleteDialog(row: any) {
    this.dialog
      .open(MonetaryDeficitDeleteComponent, {
        width: '450px',
        data: row,
        disableClose:true
      })
      .afterClosed()
      .subscribe((value) => {
        if (value === 'delete') {
          this.getAll();
        }
      });
  }

  exportXlsx() {
    let element = document.getElementById('monetaryDeficitTable');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kasa Açıkları');
    XLSX.writeFile(wb, 'Kasa Açıkları.xlsx');
  }
}
