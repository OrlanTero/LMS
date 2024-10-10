<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class PostMediaAbstract extends ModelDefaultFunctions
{
    public $post_media_id;
    public $post_id;

    public $filepath;

    public $status;

    public $date_created;
}