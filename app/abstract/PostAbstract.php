<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class PostAbstract extends ModelDefaultFunctions
{
    public $post_id;

    public $user_id;

    public $post_type;

    public $content;

    public $status;

    public $date_created;
}