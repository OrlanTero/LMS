<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitcdb8c418f1815fbccea398bfa2f0631f
{
    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'PHPMailer\\PHPMailer\\' => 20,
        ),
        'K' => 
        array (
            'Klein\\' => 6,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'PHPMailer\\PHPMailer\\' => 
        array (
            0 => __DIR__ . '/..' . '/phpmailer/phpmailer/src',
        ),
        'Klein\\' => 
        array (
            0 => __DIR__ . '/..' . '/klein/klein/src/Klein',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitcdb8c418f1815fbccea398bfa2f0631f::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitcdb8c418f1815fbccea398bfa2f0631f::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitcdb8c418f1815fbccea398bfa2f0631f::$classMap;

        }, null, ClassLoader::class);
    }
}
