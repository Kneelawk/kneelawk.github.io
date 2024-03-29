import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {BASE_URL, IndexDirectory, IndexReaderService} from '../index-reader.service';

@Component({
  selector: 'app-docs-index',
  templateUrl: './docs-index.component.html',
  styleUrls: ['./docs-index.component.css'],
  providers: [
    {provide: 'docs.index', useClass: IndexReaderService},
    {provide: BASE_URL, useValue: '/docs.index'}
  ]
})
export class DocsIndexComponent implements OnInit {

  path: Observable<string[]>
  displayPath: string = ''

  display: PageDisplay = new Loading()
  parent: Parent | undefined

  constructor(private router: Router, private route: ActivatedRoute, @Inject('docs.index') private reader: IndexReaderService) {
    this.path = route.fragment.pipe(map(value => value?.split('/') || []));
  }

  ngOnInit(): void {
    this.path.subscribe(path => {
      this.displayPath = path.join('/');

      let sanitized = IndexReaderService.sanitizePath([...path])
      if (sanitized.length > 1) {
        this.parent = new Parent(sanitized[sanitized.length - 2], sanitized.slice(0, -1).join('/'))
      } else if (sanitized.length == 1) {
        this.parent = new Parent('/', '')
      } else {
        this.parent = undefined
      }
    })

    this.path.pipe(switchMap(path => {
      let sanitized = IndexReaderService.sanitizePath([...path])
      if (sanitized.length != path.length && !(sanitized.length == 0 && path.length == 1)) {
        return of<IndexLookupResult>(new ResRedirect(sanitized.join('/')))
      }
      return this.reader.getIndex(path).pipe(map(index => new ResSuccess(index)), catchError(e => of(new ResError(e))))
    })).subscribe({
      next: value => {
        console.log(value)
        switch (value.kind) {
          case 'redirect':
            this.router.navigate([], {fragment: (value as ResRedirect).url})
            break
          case 'error':
            this.display = new Error()
            break
          case 'success':
            this.display = new Loaded((value as ResSuccess).index)
            break
        }
      },
      error: err => console.error(err)
    });
  }

  asLoaded(dis: PageDisplay): Loaded {
    return dis as Loaded
  }
}

class ResRedirect implements IndexLookupResult {
  constructor(public url: string) {
  }

  kind: string = 'redirect'
}

class ResError implements IndexLookupResult {
  constructor(public error: any) {
  }

  kind: string = 'error'
}

class ResSuccess implements IndexLookupResult {
  constructor(public index: IndexDirectory) {
  }

  kind: string = 'success'
}

interface IndexLookupResult {
  kind: string
}

export interface PageDisplay {
  kind: string
}

export class Loading implements PageDisplay {
  kind: string = 'loading'
}

export class Error implements PageDisplay {
  kind: string = 'error'
}

export class Loaded implements PageDisplay {
  constructor(public index: IndexDirectory) {
  }

  kind: string = 'loaded'
}

export class Parent {
  constructor(public name: string, public path: string) {
  }
}
