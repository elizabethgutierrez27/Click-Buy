import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.router.url);
      });
  }

  private createBreadcrumbs(url: string): Array<{ label: string; url: string }> {
    const breadcrumbs = [];
    const segments = url.split('/').filter((segment) => segment !== '');

    let currentUrl = '';
    for (const segment of segments) {
      currentUrl += `/${segment}`;
      breadcrumbs.push({
        label: this.formatLabel(segment),
        url: currentUrl,
      });
    }

    return breadcrumbs;
  }

  private formatLabel(segment: string): string {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
