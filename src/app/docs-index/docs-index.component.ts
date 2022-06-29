import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { map, Observable, switchMap } from "rxjs";
import { BASE_URL, IndexReaderService } from "../index-reader.service";

@Component({
  selector: 'app-docs-index',
  templateUrl: './docs-index.component.html',
  styleUrls: ['./docs-index.component.css'],
  providers: [
    { provide: BASE_URL, useValue: '/docs.index' }
  ]
})
export class DocsIndexComponent implements OnInit {

  path: Observable<string[] | undefined>

  constructor(private route: ActivatedRoute, private reader: IndexReaderService) {
    this.path = route.fragment.pipe(map(value => value?.split('/')));
  }

  ngOnInit(): void {
    this.path.pipe(map(path => path || []), switchMap(path => {
      // TODO: handle re-route non-sane paths and handle index-lookup errors
      return this.reader.getIndex(path)
    })).subscribe({
      next: value => console.log(value),
      error: err => console.error(err)
    });
  }
}
