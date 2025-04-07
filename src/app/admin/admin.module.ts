import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SubnavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';

@NgModule({
    imports: [
        CommonModule,
        AdminRoutingModule,
        ReactiveFormsModule,
    ],
    declarations: [
        SubnavComponent,
        LayoutComponent,
        OverviewComponent,
    ]
})
export class AdminModule { }
