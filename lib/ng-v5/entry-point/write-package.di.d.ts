import { InjectionToken } from 'injection-js';
import { Transform } from '../../brocc/transform';
import { TransformProvider } from '../../brocc/transform.di';
export declare const WRITE_PACKAGE_TRANSFORM_TOKEN: InjectionToken<Transform>;
export declare const WRITE_PACKAGE_TRANSFORM: TransformProvider;
