import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";

export const BASE_URL = new InjectionToken<string>("BASE_URL");

@Injectable({
  providedIn: 'root'
})
export class IndexReaderService {
  private readonly fullBaseUrl: string

  constructor(private client: HttpClient, @Inject(BASE_URL) private baseUrl: string) {
    this.fullBaseUrl = environment.baseUrl + baseUrl;
  }

  private static sanitizePath(path: string[]): string[] {
    if (path.length == 0) {
      return path;
    }

    for (let i = path.length; i >= 0; i--) {
      if (!path[i]) {
        path.splice(i, 1);
      }
    }

    return path;
  }

  private indexUrl(path: string[]): string {
    let newPath = Object.assign([], path);
    newPath.unshift(this.fullBaseUrl);
    newPath.push("index.json");

    return newPath.join("/");
  }

  getIndex(path: string[]): Observable<IndexDirectory> {
    let sane = IndexReaderService.sanitizePath(path);
    let url = this.indexUrl(sane);

    return this.client.get<IndexDirectory>(url);
  }
}

export enum IndexChildType {
  directory = "directory", file = "file"
}

interface IndexDirectory {
  name: string;
  path: string;
  children: IndexChild[];
}

interface IndexChild {
  path: string;
  name: string;
  size: number;
  type: IndexChildType;
}
