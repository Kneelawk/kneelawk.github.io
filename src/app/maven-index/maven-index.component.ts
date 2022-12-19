import {Component, Inject, OnInit} from '@angular/core';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {BASE_URL, IndexChild, IndexDirectory, IndexReaderService} from '../index-reader.service';
import * as semver from 'semver';

@Component({
  selector: 'app-maven-index',
  templateUrl: './maven-index.component.html',
  styleUrls: ['./maven-index.component.css'],
  providers: [
    {provide: 'maven.index', useClass: IndexReaderService},
    {provide: BASE_URL, useValue: '/maven.index'}
  ]
})
export class MavenIndexComponent implements OnInit {

  path: Observable<string[]>
  displayPath: string = ''

  display: PageDisplay = new Loading()
  parent: Parent | undefined

  constructor(private router: Router, private route: ActivatedRoute, @Inject('maven.index') private reader: IndexReaderService) {
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
      return this.reader.getIndex(path).pipe(map(index => new ResSuccess(index, sanitized)), catchError(e => of(new ResError(e))))
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
            let success = value as ResSuccess
            this.display = new Loaded(success.index, success.path)
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
  constructor(public index: IndexDirectory, public path: string[]) {
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
  public maven: Maven | undefined

  constructor(public index: IndexDirectory, public path: string[]) {
    if (index.children.some(child => child.name.endsWith('.jar')) && path.length >= 3) {
      this.maven = new Maven(path.slice(0, -2).join('.'), path[path.length - 2], path[path.length - 1])
    } else if (index.children.some(child => child.name == 'maven-metadata.xml') && path.length >= 2) {
      let latestVersion = findLatest(index.children)
      if (latestVersion != null) {
        this.maven = new Maven(path.slice(0, -1).join('.'), path[path.length - 1], latestVersion)
      }
    }
  }

  kind: string = 'loaded'
}

export class Maven {
  constructor(public group: string, public artifact: string, public version: string) {
  }
}

export class Parent {
  constructor(public name: string, public path: string) {
  }
}

function findLatest(children: IndexChild[]): string | null {
  let latest: string | null = null

  children.forEach(child => {
    if (semver.valid(child.name) && (latest == null || semver.gt(child.name, latest))) {
      latest = child.name
    }
  })

  return latest
}
