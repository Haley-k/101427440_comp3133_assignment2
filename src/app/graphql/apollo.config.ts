import { provideApollo } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import {
  inject,
  runInInjectionContext,
  EnvironmentInjector,
} from '@angular/core';

export function provideGraphQLClient() {
  return provideApollo((): ApolloClientOptions<any> => {
    const injector = inject(EnvironmentInjector);

    return runInInjectionContext(injector, () => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'https://comp3133-101427440-assignment1-1.onrender.com/graphql',
        }),
        cache: new InMemoryCache(),
      };
    });
  });
}
