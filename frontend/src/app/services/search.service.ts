import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:3000/producto/search'; 

  constructor(private http: HttpClient) {}

  searchProducts(term: string): Observable<any> {
    return this.http.get(this.apiUrl, { params: { term } });
  }
}
