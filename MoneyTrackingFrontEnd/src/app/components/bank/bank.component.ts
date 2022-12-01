import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Bank } from 'src/app/models/bank';
import { BankService } from 'src/app/services/bank.service';
import { BankDeleteComponent } from './bank-delete/bank-delete.component';
import { BankViewComponent } from './bank-view/bank-view.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
})
export class BankComponent {
  bank: Bank[] = [];
  dataLoaded = false;
  searchHide = false;
  filterText: '';
  displayedColumns: string[] = ['bankName', 'action'];
  dataSource: MatTableDataSource<Bank> = new MatTableDataSource<Bank>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private bankService: BankService,
    private dialog: MatDialog,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  filterDataSource() {
    this.dataSource.filter = this.filterText.trim().toLocaleLowerCase();
  }

  getAll() {
    this.bankService.getAll().subscribe(
      (response) => {
        this.bank = response.data;
        this.dataSource = new MatTableDataSource<Bank>(this.bank);
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
      .open(BankViewComponent, {
        width: '20%',
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
      .open(BankViewComponent, {
        width: '20%',
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
      .open(BankDeleteComponent, {
        width: '20%',
        data: row,
      })
      .afterClosed()
      .subscribe((value) => {
        if (value === 'delete') {
          this.getAll();
        }
      });
  }

  exportXlsx() {
    let element = document.getElementById('bankTable');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bankalar');
    XLSX.writeFile(wb, 'Banka Listesi.xlsx');
  }
}