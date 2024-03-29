import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserOperationClaimsDto } from 'src/app/models/Dtos/userOperationClaimsDto';
import { UserService } from 'src/app/services/user.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-operations-setting',
  templateUrl: './user-operations-setting.component.html',
  styleUrls: ['./user-operations-setting.component.scss']
})
export class UserOperationsSettingComponent {
  userId: string | null | undefined;
  userOperationClaim: UserOperationClaimsDto[] = [];
  dataLoaded = false;
  searchHide = false;
  filterText: '';
  displayedColumns: string[] = ['description', 'status'];
  dataSource: MatTableDataSource<UserOperationClaimsDto> = new MatTableDataSource<UserOperationClaimsDto>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  userOperationForm: FormGroup;


  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        this.userId = params.get('id');
      }
    );
    this.getAllUserOperationClaim();
  }

  getAllUserOperationClaim() {
    this.userService.getAllUserOperationClaims(this.userId).subscribe(
      (response) => {
        this.userOperationClaim = response.data;
        this.dataSource = new MatTableDataSource<UserOperationClaimsDto>(this.userOperationClaim);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataLoaded = true;

      },
      (responseError) => {
        this.toastrService.error(responseError.data.message, 'Dikkat');
      }
    );
  }

  filterDataSource() {
    this.dataSource.filter = this.filterText.trim().toLocaleLowerCase();
  }

  userOperationStatus(row:any) {
    if (row.status) {
      this.updateUserOperationForm(row.status,row.userOperationClaimId,row.userId,row.operationClaimId);
    this.update();
    }
    else {
      this.updateUserOperationForm(row.status,row.userOperationClaimId,row.userId,row.operationClaimId);
    this.update();
    }
  }

  updateUserOperationForm(status:boolean,userOperationClaimId:number,userId:number,operationClaimId:number) {
    if (status) {
      this.userOperationForm = this.formBuilder.group({
        userOperationClaimId: [userOperationClaimId],
        userId: [userId],
        operationClaimId: [operationClaimId],
        status: [status]
      });
    } else {
      this.userOperationForm = this.formBuilder.group({
        userOperationClaimId: [userOperationClaimId],
        userId: [userId],
        operationClaimId: [operationClaimId],
        status: [status]
      });
    }
  }

  update() {
    if (this.userOperationForm.valid) {
      let userOperationModel = Object.assign({}, this.userOperationForm.value);
      this.userService.updateOperationClaim(userOperationModel).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
        },
        (responseError) => {
          if (responseError.error.ValidationErrors == undefined) {
            this.toastrService.error(responseError.error, 'Dikkat');
          } else {
            if (responseError.error.ValidationErrors.length > 0) {
              for (
                let i = 0;
                i < responseError.error.ValidationErrors.length;
                i++
              ) {
                this.toastrService.error(
                  responseError.error.ValidationErrors[i].ErrorMessage,
                  'Doğrulama Hatası'
                );
              }
            }
          }
        }
      );
    } else {
      this.toastrService.error('Formunuz Eksik', 'Dikkat');
    }
  }

  exportXlsx() {
    let element = document.getElementById('userOperationsTable');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcı Yetkileri');
    XLSX.writeFile(wb, 'Kullanıcı Yetkileri.xlsx');
  }









}
